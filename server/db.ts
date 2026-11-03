import { eq, and, asc, desc, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cartItems,
  categories,
  deliveryRules,
  InsertUser,
  orderComments,
  orderItems,
  notifications,
  payfastItnAttempts,
  paymentEvents,
  orders,
  productImages,
  products,
  shippingDetails,
  shipmentTrackingEvents,
  userApprovals,
  users,
  watermarkSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export async function upsertUser(user: Record<string, unknown>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const openId = user.openId as string | null | undefined;
  if (!openId) return;

  const isOwner = openId === ENV.ownerOpenId;
  const role = isOwner ? "admin" : ((user.role as string) ?? "user");
  const email = (user.email as string | null) ?? "";
  const fullName = (user.fullName as string) ?? (user.name as string) ?? openId;

  await db
    .insert(users)
    .values({
      openId,
      fullName,
      email,
      loginMethod: (user.loginMethod as string) ?? "oauth",
      role: role as "user" | "admin",
      status: isOwner ? "approved" : "pending",
      lastSignedIn: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: {
        fullName: fullName ?? undefined,
        email: email ?? undefined,
        loginMethod: (user.loginMethod as string) ?? undefined,
        lastSignedIn: new Date(),
      },
    });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createEmailUser(data: {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  passwordHash: string;
  isOver18: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    role: "user",
    status: "pending",
    isOver18: data.isOver18,
    isActive: true,
  });
  const userId = (result as unknown as { insertId: number }).insertId;
  // Create approval record
  await db.insert(userApprovals).values({
    userId,
    submittedData: { fullName: data.fullName, email: data.email, phone: data.phone, city: data.city },
    status: "pending",
  });
  return userId;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      city: users.city,
      role: users.role,
      status: users.status,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}

export async function updateUserStatus(
  userId: number,
  status: "approved" | "rejected",
  adminId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ status }).where(eq(users.id, userId));
  await db
    .update(userApprovals)
    .set({ status, approvedBy: adminId, adminNotes: notes ?? null, reviewedAt: new Date() })
    .where(eq(userApprovals.userId, userId));
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(opts?: { excludeNames?: string[] }) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.name);
  if (!opts?.excludeNames?.length) return rows;
  const excluded = new Set(opts.excludeNames.map((name) => name.trim().toLowerCase()));
  return rows.filter((row) => !excluded.has(row.name.trim().toLowerCase()));
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values({ ...data, isActive: true });
}

export async function updateCategory(
  id: number,
  data: { name?: string; slug?: string; description?: string; isActive?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function setCategoryPromotedProduct(categoryId: number, productId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const category = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (!category[0]) throw new Error("Category not found");

  if (productId !== null) {
    const candidate = await db
      .select({ id: products.id })
      .from(products)
      .innerJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
      .where(and(eq(products.id, productId), eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .limit(1);

    if (!candidate[0]) {
      throw new Error("Select an active product from this category with a primary image");
    }
  }

  await db.update(categories).set({ promotedProductId: productId }).where(eq(categories.id, categoryId));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  categoryId?: number;
  search?: string;
  featuredOnly?: boolean;
  imageOnly?: boolean;
  activeOnly?: boolean;
  excludeCategoryNames?: string[];
}) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      description: products.description,
      dosageInfo: products.dosageInfo,
      categoryId: products.categoryId,
      price: products.price,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        opts?.activeOnly !== false ? eq(products.isActive, true) : undefined,
        opts?.categoryId ? eq(products.categoryId, opts.categoryId) : undefined,
        opts?.featuredOnly ? eq(products.isFeatured, true) : undefined
      )
    )
    .orderBy(products.createdAt);

  // Attach primary images
  const productIds = rows.map((r) => r.id);
  if (productIds.length === 0) return rows.map((r) => ({ ...r, primaryImage: null }));

  const images = await db
    .select()
    .from(productImages)
    .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));

  const imageMap = new Map(images.map((img) => [img.productId, img.imageUrl]));

  let filtered = rows;
  if (opts?.excludeCategoryNames?.length) {
    const excluded = new Set(opts.excludeCategoryNames.map((name) => name.trim().toLowerCase()));
    filtered = filtered.filter((row) => !excluded.has((row.categoryName ?? "").trim().toLowerCase()));
  }
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    filtered = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
    );
  }
  if (opts?.imageOnly) {
    filtered = filtered.filter((row) => imageMap.has(row.id));
  }

  const popularityRows = productIds.length > 0
    ? await db
        .select({
          productId: orderItems.productId,
          salesCount: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(inArray(orderItems.productId, productIds), sql`${orders.status} NOT IN ('cancelled', 'quote_rejected')`))
        .groupBy(orderItems.productId)
    : [];
  const popularityMap = new Map(popularityRows.map((row) => [row.productId, Number(row.salesCount ?? 0)]));

  return filtered.map((r) => ({
    ...r,
    primaryImage: imageMap.get(r.id) ?? null,
    salesCount: popularityMap.get(r.id) ?? 0,
  }));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!result[0]) return undefined;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, result[0].products.id))
    .orderBy(productImages.isPrimary);

  return { ...result[0].products, category: result[0].categories, images };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: {
  name: string;
  slug: string;
  brand?: "hd_labs" | "bp_pharma" | "other";
  description?: string;
  dosageInfo?: string;
  categoryId?: number;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function updateProduct(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    brand: "hd_labs" | "bp_pharma" | "other";
    description: string;
    dosageInfo: string;
    categoryId: number;
    price: string;
    stockQuantity: number;
    isActive: boolean;
    isFeatured: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

// ─── Product Images ───────────────────────────────────────────────────────────

export async function addProductImage(data: {
  productId: number;
  imageUrl: string;
  imageKey: string;
  isPrimary: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.isPrimary) {
    await db
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, data.productId));
  }
  await db.insert(productImages).values(data);
}

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages).where(eq(productImages.productId, productId));
}

export async function getProductsForImageMatching() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: products.id, name: products.name, slug: products.slug, isActive: products.isActive })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.name);
}

export function normalizeProductImageKey(value: string) {
  return value
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getProductImageMatchKeys(product: { name: string; slug: string }) {
  return [normalizeProductImageKey(product.name), normalizeProductImageKey(product.slug)];
}

export async function saveProductImage(data: {
  productId: number;
  imageUrl: string;
  imageKey: string;
  isPrimary: boolean;
}) {
  return addProductImage(data);
}

export async function getProductImageCount(productId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, productId));
  return rows.length;
}

export async function setPrimaryImageIfNeeded(productId: number) {
  const db = await getDb();
  if (!db) return;
  const primary = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(and(eq(productImages.productId, productId), eq(productImages.isPrimary, true)))
    .limit(1);
  if (!primary[0]) {
    const first = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.createdAt)
      .limit(1);
    if (first[0]) await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, first[0].id));
  }
}


export async function setPrimaryImage(imageId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(productImages)
    .set({ isPrimary: false })
    .where(eq(productImages.productId, productId));
  await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, imageId));
}

export async function deleteProductImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productImages).where(eq(productImages.id, imageId));
}

// ─── Watermark Settings ──────────────────────────────────────────────────────

export const DEFAULT_WATERMARK_SETTINGS = {
  isEnabled: true,
  watermarkText: "ANABOLICS AFRICA",
  logoUrl: null,
  logoKey: null,
} as const;

export type WatermarkSettingsUpdate = Partial<{
  isEnabled: boolean;
  watermarkText: string;
  logoUrl: string | null;
  logoKey: string | null;
}>;

export async function getWatermarkSettings() {
  const db = await getDb();
  if (!db) return DEFAULT_WATERMARK_SETTINGS;

  const settings = await db
    .select({
      isEnabled: watermarkSettings.isEnabled,
      watermarkText: watermarkSettings.watermarkText,
      logoUrl: watermarkSettings.logoUrl,
      logoKey: watermarkSettings.logoKey,
      updatedAt: watermarkSettings.updatedAt,
    })
    .from(watermarkSettings)
    .where(eq(watermarkSettings.id, 1))
    .limit(1);

  return settings[0] ?? DEFAULT_WATERMARK_SETTINGS;
}

export async function updateWatermarkSettings(data: WatermarkSettingsUpdate, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select({ id: watermarkSettings.id })
    .from(watermarkSettings)
    .where(eq(watermarkSettings.id, 1))
    .limit(1);

  const updatedAt = new Date();
  if (existing[0]) {
    await db
      .update(watermarkSettings)
      .set({ ...data, updatedBy: adminId, updatedAt })
      .where(eq(watermarkSettings.id, 1));
  } else {
    await db.insert(watermarkSettings).values({
      id: 1,
      isEnabled: data.isEnabled ?? DEFAULT_WATERMARK_SETTINGS.isEnabled,
      watermarkText: data.watermarkText ?? DEFAULT_WATERMARK_SETTINGS.watermarkText,
      logoUrl: data.logoUrl ?? null,
      logoKey: data.logoKey ?? null,
      updatedBy: adminId,
      updatedAt,
    });
  }

  return getWatermarkSettings();
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productPrice: products.price,
      productStock: products.stockQuantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  const productIds = items.map((i) => i.productId);
  if (productIds.length === 0) return items.map((i) => ({ ...i, primaryImage: null }));

  const images = await db
    .select()
    .from(productImages)
    .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));

  const imageMap = new Map(images.map((img) => [img.productId, img.imageUrl]));
  return items.map((i) => ({ ...i, primaryImage: imageMap.get(i.productId) ?? null }));
}

export async function upsertCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeCartItem(userId: number, cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export function calculateDelivery(city: string): { type: "free" | "flat_rate"; fee: number } {
  const normalized = city.trim().toLowerCase();
  const freeLocations = ["port elizabeth", "gqeberha", "pe"];
  if (freeLocations.some((loc) => normalized.includes(loc))) {
    return { type: "free", fee: 0 };
  }
  return { type: "flat_rate", fee: 150 };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  userId: number;
  items: Array<{ productId: number; quantity: number; priceAtPurchase: string }>;
  totalAmount: string;
  deliveryFee: string;
  deliveryType: "free" | "flat_rate";
  quoteNotes?: string;
  status?: "pending" | "quote_pending";
  shipping: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const lineItems = normalizeOrderLineItems(data.items);

  return db.transaction(async (tx) => {
    const orderResult = await tx.insert(orders).values({
      userId: data.userId,
      totalAmount: data.totalAmount,
      deliveryFee: data.deliveryFee,
      deliveryType: data.deliveryType,
      status: data.status ?? "quote_pending",
      paymentStatus: "pending",
      quoteNotes: data.quoteNotes ?? null,
    });
    const orderId = extractInsertId(orderResult);

    await tx.insert(orderItems).values(lineItems.map((item) => ({ orderId, ...item })));
    await tx.insert(shippingDetails).values({ orderId, ...data.shipping });
    await tx.insert(paymentEvents).values({
      orderId,
      eventType: "quote_submitted",
      paymentStatus: "pending",
      amount: data.totalAmount,
      actorUserId: data.userId,
      note: "Quote request submitted for admin review.",
    });
    await tx.delete(cartItems).where(eq(cartItems.userId, data.userId));

    return orderId;
  });
}

export function normalizeOrderLineItems(items: Array<{ productId: number; quantity: number; priceAtPurchase: string | number }>) {
  if (items.length === 0) {
    throw new Error("Order requires at least one item");
  }

  return items.map((item, index) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const price = Number.parseFloat(String(item.priceAtPurchase));

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      throw new Error(`Invalid product on order line ${index + 1}`);
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity on order line ${index + 1}`);
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Invalid price on order line ${index + 1}`);
    }

    return { productId, quantity, priceAtPurchase: price.toFixed(2) };
  });
}

export function extractInsertId(result: unknown) {
  const header = Array.isArray(result) ? result[0] : result;
  const orderId = Number((header as { insertId?: unknown } | undefined)?.insertId);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error("Order creation did not return a valid identifier");
  }
  return orderId;
}

export async function recordPaymentEvent(data: {
  orderId: number;
  eventType: string;
  paymentStatus: string;
  paymentMethod?: "eft" | "payfast" | null;
  amount?: string | null;
  reference?: string | null;
  note?: string | null;
  actorUserId?: number | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentEvents).values({
    orderId: data.orderId,
    eventType: data.eventType,
    paymentStatus: data.paymentStatus,
    paymentMethod: data.paymentMethod ?? null,
    amount: data.amount ?? null,
    reference: data.reference ?? null,
    note: data.note ?? null,
    actorUserId: data.actorUserId ?? null,
  });
  return (result as unknown as { insertId: number }).insertId;
}

export type PayfastItnAttemptInput = {
  payfastReference: string | null;
  pfPaymentId: string | null;
  merchantId: string | null;
  paymentStatus: string;
  amountGross: string | null;
  validationStatus: "pending" | "valid" | "invalid";
  processingStatus?: "pending" | "processed" | "failed";
  failureReason?: string | null;
};

export async function recordPayfastItnAttempt(data: PayfastItnAttemptInput) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(payfastItnAttempts).values({
    ...data,
    processingStatus: data.processingStatus ?? "pending",
    failureReason: data.failureReason?.slice(0, 512) ?? null,
    lastAttemptAt: new Date(),
  });
  return (result as unknown as { insertId: number }).insertId;
}

export async function markPayfastItnAttemptProcessed(attemptId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(payfastItnAttempts).set({ processingStatus: "processed", processedAt: new Date(), lastAttemptAt: new Date() }).where(eq(payfastItnAttempts.id, attemptId));
}

export async function markPayfastItnAttemptValidated(attemptId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(payfastItnAttempts).set({ validationStatus: "valid", lastAttemptAt: new Date() }).where(eq(payfastItnAttempts.id, attemptId));
}

export async function markPayfastItnAttemptInvalid(attemptId: number, failureReason: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(payfastItnAttempts).set({ validationStatus: "invalid", processingStatus: "failed", failureReason: failureReason.slice(0, 512), lastAttemptAt: new Date() }).where(eq(payfastItnAttempts.id, attemptId));
}

export async function markPayfastItnAttemptFailed(attemptId: number, failureReason: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(payfastItnAttempts).set({ processingStatus: "failed", failureReason: failureReason.slice(0, 512), lastAttemptAt: new Date(), retryCount: sql`${payfastItnAttempts.retryCount} + 1` }).where(eq(payfastItnAttempts.id, attemptId));
}

export async function getPayfastItnAttempts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payfastItnAttempts).orderBy(desc(payfastItnAttempts.createdAt)).limit(100);
}

export async function getPayfastItnAttempt(attemptId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(payfastItnAttempts).where(eq(payfastItnAttempts.id, attemptId)).limit(1);
  return result[0] ?? null;
}

export async function getPaymentEvents(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(paymentEvents)
    .where(eq(paymentEvents.orderId, orderId))
    .orderBy(asc(paymentEvents.createdAt));
}

export async function reviewQuote(
  orderId: number,
  adminId: number,
  decision: "quote_approved" | "quote_rejected",
  notes?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order[0]) throw new Error("Quote not found");
  if (order[0].status !== "quote_pending") throw new Error("Quote has already been reviewed");
  if (decision === "quote_approved") {
    const unavailable = await db.select({ id: orderItems.id }).from(orderItems).where(and(eq(orderItems.orderId, orderId), inArray(orderItems.availabilityStatus, ["pending", "out_of_stock"]))).limit(1);
    if (unavailable[0]) throw new Error("Confirm every quote item as in stock before approval");
  }

  await db.update(orders).set({
    status: decision,
    quoteNotes: decision === "quote_approved" ? notes ?? null : order[0].quoteNotes,
    rejectionReason: decision === "quote_rejected" ? notes ?? null : null,
    reviewedBy: adminId,
    reviewedAt: new Date(),
  }).where(eq(orders.id, orderId));
  await recordPaymentEvent({
    orderId,
    eventType: decision,
    paymentStatus: order[0].paymentStatus,
    paymentMethod: order[0].paymentMethod ?? null,
    amount: order[0].totalAmount,
    actorUserId: adminId,
    note: notes ?? null,
  });
}

export async function updateOrderItemAvailability(data: {
  orderId: number;
  itemId: number;
  availabilityStatus: "pending" | "in_stock" | "out_of_stock";
  availabilityNotes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const item = await db.select({ id: orderItems.id, orderStatus: orders.status }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(and(eq(orderItems.id, data.itemId), eq(orderItems.orderId, data.orderId))).limit(1);
  if (!item[0]) throw new Error("Quote item not found");
  if (item[0].orderStatus !== "quote_pending") throw new Error("Only quotes awaiting review can change item availability");
  await db.update(orderItems).set({ availabilityStatus: data.availabilityStatus, availabilityNotes: data.availabilityNotes?.trim() || null }).where(eq(orderItems.id, data.itemId));
  return { success: true };
}

export async function chooseQuotePayment(
  orderId: number,
  userId: number,
  method: "eft" | "payfast",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!order[0]) throw new Error("Quote not found");
  const unavailable = await db.select({ id: orderItems.id }).from(orderItems).where(and(eq(orderItems.orderId, orderId), inArray(orderItems.availabilityStatus, ["pending", "out_of_stock"]))).limit(1);
  if (unavailable[0]) throw new Error("Payment is unavailable until every quote item is confirmed in stock");
  const canSelectPayment = order[0].status === "quote_approved"
    || (order[0].status === "awaiting_payment" && order[0].paymentStatus !== "awaiting_eft");
  if (!canSelectPayment) throw new Error("Quote is not available for payment selection");

  const payfastReference = `AA-${orderId}-${Date.now()}`;
  const paymentStatus = "pending";
  await db.update(orders).set({
    paymentMethod: method,
    status: "awaiting_payment",
    paymentStatus,
    payfastReference,
  }).where(eq(orders.id, orderId));
  await recordPaymentEvent({
    orderId,
    eventType: "payment_method_selected",
    paymentStatus,
    paymentMethod: method,
    amount: order[0].totalAmount,
    reference: payfastReference,
    actorUserId: userId,
    note: method === "eft"
      ? "PayFast Instant EFT selected for approved quote."
      : "PayFast checkout selected for approved quote.",
  });

  return { payfastReference, total: order[0].totalAmount };
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!orderResult[0]) return undefined;

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      availabilityStatus: orderItems.availabilityStatus,
      availabilityNotes: orderItems.availabilityNotes,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const shipping = await db
    .select()
    .from(shippingDetails)
    .where(eq(shippingDetails.orderId, orderId))
    .limit(1);

  const comments = await getOrderComments(orderId);
  const paymentHistory = await getPaymentEvents(orderId);
  const trackingEvents = await getShipmentTrackingEvents(orderId);
  return { ...orderResult[0], items, shipping: shipping[0] ?? null, comments, paymentHistory, trackingEvents };
}

export async function getShipmentTrackingEvents(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(shipmentTrackingEvents)
    .where(eq(shipmentTrackingEvents.orderId, orderId))
    .orderBy(desc(shipmentTrackingEvents.occurredAt), desc(shipmentTrackingEvents.createdAt));
}

export async function persistShiplogicTracking(data: {
  orderId: number;
  trackingReference: string;
  providerStatus: string;
  normalizedStatus: "pending" | "packed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "returned";
  events: Array<{
    providerEventId: string | null;
    providerStatus: string;
    normalizedStatus: "pending" | "packed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "returned";
    message: string | null;
    location: string | null;
    occurredAt: Date | null;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const current = await db.select({ id: shippingDetails.id }).from(shippingDetails).where(eq(shippingDetails.orderId, data.orderId)).limit(1);
  if (current[0]) {
    await db.update(shippingDetails).set({ trackingProvider: "shiplogic", trackingNumber: data.trackingReference, shippingStatus: data.normalizedStatus, trackingLastCheckedAt: now, trackingLastError: null }).where(eq(shippingDetails.orderId, data.orderId));
  }
  const existing = await db.select({ providerEventId: shipmentTrackingEvents.providerEventId }).from(shipmentTrackingEvents).where(eq(shipmentTrackingEvents.orderId, data.orderId));
  const known = new Set(existing.map((event) => event.providerEventId).filter(Boolean));
  let insertedEvents = 0;
  for (const event of data.events) {
    if (event.providerEventId && known.has(event.providerEventId)) continue;
    await db.insert(shipmentTrackingEvents).values({
      orderId: data.orderId,
      provider: "shiplogic",
      trackingReference: data.trackingReference,
      providerEventId: event.providerEventId,
      providerStatus: event.providerStatus,
      normalizedStatus: event.normalizedStatus,
      message: event.message,
      location: event.location,
      occurredAt: event.occurredAt,
    });
    if (event.providerEventId) known.add(event.providerEventId);
    insertedEvents += 1;
  }
  return { checkedAt: now, insertedEvents };
}

export async function markShiplogicTrackingError(orderId: number, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(shippingDetails).set({ trackingLastCheckedAt: new Date(), trackingLastError: message.slice(0, 512) }).where(eq(shippingDetails.orderId, orderId));
}

export async function getOrderComments(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: orderComments.id,
      orderId: orderComments.orderId,
      userId: orderComments.userId,
      body: orderComments.body,
      createdAt: orderComments.createdAt,
      authorName: users.fullName,
      authorRole: users.role,
    })
    .from(orderComments)
    .innerJoin(users, eq(orderComments.userId, users.id))
    .where(eq(orderComments.orderId, orderId))
    .orderBy(desc(orderComments.createdAt));
}

export async function createOrderComment(data: { orderId: number; userId: number; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderComments).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      deliveryFee: orders.deliveryFee,
      deliveryType: orders.deliveryType,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      payfastReference: orders.payfastReference,
      eftProofUrl: orders.eftProofUrl,
      eftProofName: orders.eftProofName,
      quoteNotes: orders.quoteNotes,
      rejectionReason: orders.rejectionReason,
      reviewedAt: orders.reviewedAt,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userId: orders.userId,
      userFullName: users.fullName,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(orders.createdAt);
}

export async function updateShippingDetails(data: {
  orderId: number;
  courierName?: string | null;
  trackingProvider?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingStatus: "pending" | "packed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "returned";
  shippingNotes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const current = await db.select().from(shippingDetails).where(eq(shippingDetails.orderId, data.orderId)).limit(1);
  const now = new Date();
  const shippedAt = ["dispatched", "in_transit", "out_for_delivery", "delivered"].includes(data.shippingStatus) ? (current[0]?.shippedAt ?? now) : current[0]?.shippedAt ?? null;
  const deliveredAt = data.shippingStatus === "delivered" ? (current[0]?.deliveredAt ?? now) : current[0]?.deliveredAt ?? null;
  const details = {
    courierName: data.courierName || null,
    trackingProvider: data.trackingProvider || null,
    trackingNumber: data.trackingNumber || null,
    trackingUrl: data.trackingUrl || null,
    shippingStatus: data.shippingStatus,
    shippedAt,
    deliveredAt,
    shippingNotes: data.shippingNotes || null,
  };

  if (current[0]) {
    await db.update(shippingDetails).set(details).where(eq(shippingDetails.orderId, data.orderId));
  } else {
    throw new Error("Shipping address not found for order");
  }

  const orderStatus = data.shippingStatus === "delivered" ? "completed" : ["dispatched", "in_transit", "out_for_delivery"].includes(data.shippingStatus) ? "shipped" : data.shippingStatus === "packed" ? "processing" : undefined;
  if (orderStatus) {
    await db.update(orders).set({ status: orderStatus }).where(eq(orders.id, data.orderId));
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "quote_pending" | "quote_approved" | "quote_rejected" | "awaiting_payment" | "paid" | "processing" | "shipped" | "completed" | "cancelled",
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(orders)
    .set({ status, trackingNotes: notes ?? undefined })
    .where(eq(orders.id, orderId));
}

export async function updateOrderEftProof(data: { orderId: number; eftProofUrl: string; eftProofKey: string; eftProofName: string; paymentStatus: "awaiting_eft" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(orders)
    .set({
      eftProofUrl: data.eftProofUrl,
      eftProofKey: data.eftProofKey,
      eftProofName: data.eftProofName,
      paymentStatus: data.paymentStatus,
    })
    .where(eq(orders.id, data.orderId));
}

export async function confirmEftPayment(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order[0]) throw new Error("Order not found");
  await db.update(orders).set({
    paymentStatus: "paid",
    status: "paid",
    paymentMethod: "eft",
  }).where(eq(orders.id, orderId));
  await recordPaymentEvent({
    orderId,
    eventType: "payment_received",
    paymentStatus: "paid",
    paymentMethod: "eft",
    amount: order[0].totalAmount,
    actorUserId: null,
    note: "EFT payment confirmed by an administrator.",
  });
  await notifyAllAdmins({
    orderId,
    type: "payment",
    title: `Payment received for Quote #${orderId}`,
    body: "An EFT payment was confirmed and the order is ready for fulfilment.",
  });
}

export async function updateOrderPayment(
  payfastReference: string,
  paymentStatus: "paid" | "failed",
  receivedAmount: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(eq(orders.payfastReference, payfastReference)).limit(1);
  if (!order[0]) throw new Error("Payment reference not found");
  const expectedAmount = Number.parseFloat(order[0].totalAmount).toFixed(2);
  if (receivedAmount !== expectedAmount) throw new Error("PayFast payment amount does not match the approved quote");
  if (order[0].paymentStatus === "paid") return;
  if (order[0].status !== "awaiting_payment" || !["payfast", "eft"].includes(order[0].paymentMethod ?? "")) {
    throw new Error("Quote is not awaiting a PayFast payment");
  }
  const paymentMethod = order[0].paymentMethod ?? "payfast";
  const methodLabel = paymentMethod === "eft" ? "PayFast Instant EFT" : "PayFast";
  await db
    .update(orders)
    .set({
      paymentStatus,
      status: paymentStatus === "paid" ? "paid" : "quote_approved",
      paymentMethod: paymentStatus === "paid" ? paymentMethod : null,
      payfastReference,
    })
    .where(eq(orders.payfastReference, payfastReference));
  await recordPaymentEvent({
    orderId: order[0].id,
    eventType: paymentStatus === "paid" ? "payment_received" : "payment_failed",
    paymentStatus,
    paymentMethod,
    amount: order[0].totalAmount,
    reference: payfastReference,
    note: paymentStatus === "paid" ? `${methodLabel} ITN confirmed payment.` : `${methodLabel} ITN reported a failed payment; the quote is ready to retry.`,
  });
  if (paymentStatus === "paid") {
    await notifyAllAdmins({
      orderId: order[0].id,
      type: "payment",
      title: `Payment received for Quote #${order[0].id}`,
      body: `${methodLabel} confirmed payment and the order is ready for fulfilment.`,
    });
  }
  await createNotification({
    userId: order[0].userId,
    orderId: order[0].id,
    type: "payment",
    title: paymentStatus === "paid" ? `Payment received for Quote #${order[0].id}` : `Payment update for Quote #${order[0].id}`,
    body: paymentStatus === "paid" ? `Your ${methodLabel} payment was confirmed and your order is now being prepared.` : `Your ${methodLabel} payment was not completed. Choose a payment option to try again.`,
  });
}

export async function createNotification(data: { userId: number; orderId?: number | null; type: "quote" | "payment" | "shipping" | "invoice" | "system"; title: string; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const targetUser = await db.select({ id: users.id }).from(users).where(eq(users.id, data.userId)).limit(1);
  if (!targetUser[0]) return null;
  const targetOrder = data.orderId ? await db.select({ id: orders.id }).from(orders).where(eq(orders.id, data.orderId)).limit(1) : [];
  const safeOrderId = targetOrder[0]?.id ?? null;
  const result = await db.insert(notifications).values({ ...data, orderId: safeOrderId });
  return (result as unknown as { insertId: number }).insertId;
}

export async function notifyAllAdmins(data: Omit<Parameters<typeof createNotification>[0], "userId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  for (const admin of admins) {
    await createNotification({ ...data, userId: admin.id });
  }
}

export async function getNotificationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}
