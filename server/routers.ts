import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  addProductImage,
  calculateDelivery,
  clearCart,
  createCategory,
  createEmailUser,
  createOrder,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  getAllCategories,
  getAllOrders,
  getAllUsers,
  getCartItems,
  getCategories,
  getDb,
  getOrderById,
  getProductById,
  getProductBySlug,
  getProductImages,
  getProducts,
  getUserByEmail,
  getUserById,
  removeCartItem,
  setPrimaryImage,
  updateCategory,
  updateOrderStatus,
  updateOrderPayment,
  updateProduct,
  updateUserStatus,
  upsertCartItem,
} from "./db";
import { z } from "zod";
import { orders, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

// ─── Middleware ───────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const approvedProcedure = protectedProcedure.use(({ ctx, next }) => {
  if ((ctx.user as any).status !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account not yet approved" });
  }
  return next({ ctx });
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      // Return full user including status
      const user = await getUserById(ctx.user.id);
      return user ?? null;
    }),

    register: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(7),
          city: z.string().min(2),
          password: z.string().min(8),
          isOver18: z.boolean().refine((v) => v === true, { message: "You must be 18+" }),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        const userId = await createEmailUser({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          city: input.city,
          passwordHash,
          isOver18: input.isOver18,
        });
        // Notify owner
        await notifyOwner({
          title: "New User Registration",
          content: `New user **${input.fullName}** (${input.email}) from ${input.city} has registered and is awaiting approval.`,
        }).catch(() => {});
        return { success: true, userId };
      }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        if (!user.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Account is deactivated" });
        }

        // Create session token
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.id.toString());
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, status: user.status } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    updateProfile: protectedProcedure
      .input(z.object({ fullName: z.string().min(2).optional(), phone: z.string().optional(), city: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set(input).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // ─── Categories ───────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getCategories()),
    listAll: adminProcedure.query(() => getAllCategories()),

    create: adminProcedure
      .input(z.object({ name: z.string().min(1), slug: z.string().min(1), description: z.string().optional() }))
      .mutation(({ input }) => createCategory(input)),

    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), slug: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional() }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCategory(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCategory(input.id)),
  }),

  // ─── Products ─────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional(), search: z.string().optional(), featuredOnly: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const rows = await getProducts({ ...input, activeOnly: true });
        const isApproved = ctx.user && (ctx.user as any).status === "approved";
        // Strip prices for non-approved users — server-enforced
        return rows.map((p) => ({
          ...p,
          price: isApproved ? p.price : null,
        }));
      }),

    listAdmin: adminProcedure
      .input(z.object({ categoryId: z.number().optional(), search: z.string().optional() }).optional())
      .query(({ input }) => getProducts({ ...input, activeOnly: false })),

    byId: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getProductById(input.id)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const product = await getProductBySlug(input.slug);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        const isApproved = ctx.user && (ctx.user as any).status === "approved";
        return { ...product, price: isApproved ? product.price : null };
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        dosageInfo: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.string(),
        stockQuantity: z.number().default(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const id = await createProduct(input);
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        dosageInfo: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.string().optional(),
        stockQuantity: z.number().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateProduct(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteProduct(input.id)),

    // Image upload: receives base64 data URL
    uploadImage: adminProcedure
      .input(z.object({
        productId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
        isPrimary: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `products/${input.productId}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await addProductImage({ productId: input.productId, imageUrl: url, imageKey: key, isPrimary: input.isPrimary });
        return { url, key };
      }),

    getImages: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => getProductImages(input.productId)),

    setPrimaryImage: adminProcedure
      .input(z.object({ imageId: z.number(), productId: z.number() }))
      .mutation(({ input }) => setPrimaryImage(input.imageId, input.productId)),

    deleteImage: adminProcedure
      .input(z.object({ imageId: z.number() }))
      .mutation(({ input }) => deleteProductImage(input.imageId)),
  }),

  // ─── Cart ─────────────────────────────────────────────────────────────────
  cart: router({
    get: approvedProcedure.query(({ ctx }) => getCartItems(ctx.user.id)),

    upsert: approvedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(({ ctx, input }) => upsertCartItem(ctx.user.id, input.productId, input.quantity)),

    remove: approvedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(({ ctx, input }) => removeCartItem(ctx.user.id, input.cartItemId)),

    clear: approvedProcedure.mutation(({ ctx }) => clearCart(ctx.user.id)),

    deliveryPreview: approvedProcedure
      .input(z.object({ city: z.string() }))
      .query(({ input }) => calculateDelivery(input.city)),
  }),

  // ─── Orders ───────────────────────────────────────────────────────────────
  orders: router({
    create: approvedProcedure
      .input(z.object({
        shipping: z.object({
          fullName: z.string().min(2),
          phone: z.string().min(7),
          addressLine1: z.string().min(5),
          addressLine2: z.string().optional(),
          city: z.string().min(2),
          postalCode: z.string().min(4),
          country: z.string().default("South Africa"),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const cartRows = await getCartItems(ctx.user.id);
        if (cartRows.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
        }

        // Validate stock and calculate totals
        for (const item of cartRows) {
          if (item.quantity > item.productStock) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${item.productName}` });
          }
        }

        const subtotal = cartRows.reduce((sum, item) => sum + parseFloat(item.productPrice) * item.quantity, 0);
        const delivery = calculateDelivery(input.shipping.city);
        const total = subtotal + delivery.fee;

        const orderId = await createOrder({
          userId: ctx.user.id,
          items: cartRows.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.productPrice,
          })),
          totalAmount: total.toFixed(2),
          deliveryFee: delivery.fee.toFixed(2),
          deliveryType: delivery.type,
          shipping: {
            fullName: input.shipping.fullName,
            phone: input.shipping.phone,
            addressLine1: input.shipping.addressLine1,
            addressLine2: input.shipping.addressLine2,
            city: input.shipping.city,
            postalCode: input.shipping.postalCode,
            country: input.shipping.country,
          },
        });

        // Set payfast reference
        const payfastRef = `AC-${orderId}-${Date.now()}`;
        const db = await getDb();
        if (db) {
          await db.update(orders).set({ payfastReference: payfastRef }).where(eq(orders.id, orderId));
        }

        await clearCart(ctx.user.id);

        return { orderId, payfastReference: payfastRef, total: total.toFixed(2), deliveryFee: delivery.fee.toFixed(2) };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const { getUserOrders } = await import("./db");
      return getUserOrders(ctx.user.id);
    }),

    detail: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),

    // PayFast ITN webhook (public, verified by signature)
    payfastItn: publicProcedure
      .input(z.object({
        m_payment_id: z.string(),
        pf_payment_id: z.string().optional(),
        payment_status: z.string(),
        item_name: z.string().optional(),
        amount_gross: z.string().optional(),
        signature: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const status = input.payment_status === "COMPLETE" ? "paid" : "failed";
        await updateOrderPayment(input.m_payment_id, status);
        return { success: true };
      }),

    // Admin
    adminList: adminProcedure.query(() => getAllOrders()),

    adminDetail: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => getOrderById(input.orderId)),

    adminUpdateStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "paid", "processing", "shipped", "completed", "cancelled"]),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => updateOrderStatus(input.orderId, input.status, input.notes)),
  }),

  // ─── Admin: Users ─────────────────────────────────────────────────────────
  admin: router({
    users: adminProcedure.query(() => getAllUsers()),

    approveUser: adminProcedure
      .input(z.object({ userId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await updateUserStatus(input.userId, "approved", ctx.user.id, input.notes);
        const user = await getUserById(input.userId);
        if (user) {
          await notifyOwner({
            title: "User Approved",
            content: `User ${user.fullName} (${user.email}) has been approved.`,
          }).catch(() => {});
        }
        return { success: true };
      }),

    rejectUser: adminProcedure
      .input(z.object({ userId: z.number(), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => updateUserStatus(input.userId, "rejected", ctx.user.id, input.notes)),

    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { totalUsers: 0, pendingUsers: 0, totalOrders: 0, revenue: 0 };
      const allUsers = await getAllUsers();
      const allOrders = await getAllOrders();
      const revenue = allOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      return {
        totalUsers: allUsers.length,
        pendingUsers: allUsers.filter((u) => u.status === "pending").length,
        approvedUsers: allUsers.filter((u) => u.status === "approved").length,
        totalOrders: allOrders.length,
        paidOrders: allOrders.filter((o) => o.paymentStatus === "paid").length,
        revenue: revenue.toFixed(2),
      };
    }),
  }),

  // ─── Delivery ─────────────────────────────────────────────────────────────
  delivery: router({
    calculate: protectedProcedure
      .input(z.object({ city: z.string() }))
      .query(({ input }) => calculateDelivery(input.city)),
  }),
});

export type AppRouter = typeof appRouter;
