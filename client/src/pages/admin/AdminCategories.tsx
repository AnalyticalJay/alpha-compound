import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Edit, Check, X, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.categories.list.useQuery();
  const productsQuery = trpc.products.listAdmin.useQuery({});
  const create = trpc.categories.create.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); setNewName(""); setNewDesc(""); toast.success("Category created"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.categories.update.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); setEditId(null); toast.success("Category updated"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.categories.delete.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); toast.success("Category deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const setPromotedProduct = trpc.categories.setPromotedProduct.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); toast.success("Category promotion updated"); },
    onError: (e) => toast.error(e.message),
  });

  const categories = categoriesQuery.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Category <span style={{ color: "#0EA5E9" }}>Management</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Organize your catalog and choose the recommendation displayed on each home-page category card.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><Plus className="h-4 w-4 text-primary" />Add Category</h2>
          <div className="space-y-3">
            <div><Label className="text-sm font-medium">Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Injectables" className="mt-1.5 border-border bg-input" /></div>
            <div><Label className="text-sm font-medium">Description (optional)</Label><Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Brief description" className="mt-1.5 border-border bg-input" /></div>
            <Button onClick={() => create.mutate({ name: newName, slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), description: newDesc || undefined })} disabled={!newName.trim() || create.isPending} className="w-full font-semibold text-white">{create.isPending ? "Creating..." : "Create Category"}</Button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><Tag className="h-4 w-4 text-primary" />Existing Categories ({categories.length})</h2>
          {categoriesQuery.isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-accent/20" />)}</div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const eligibleProducts = (productsQuery.data ?? []).filter((product) => product.categoryId === cat.id && product.primaryImage);
                return (
                  <div key={cat.id} className="rounded-lg border border-border/40 p-3">
                    {editId === cat.id ? (
                      <div className="flex items-center gap-3">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 flex-1 border-border bg-input text-sm" autoFocus />
                        <button type="button" onClick={() => update.mutate({ id: cat.id, name: editName })} className="flex h-11 w-11 items-center justify-center text-green-400 hover:text-green-300" aria-label={`Save ${cat.name}`}><Check className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setEditId(null)} className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={`Cancel editing ${cat.name}`}><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1"><p className="text-sm font-medium">{cat.name}</p>{cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}</div>
                          <button type="button" onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={`Edit ${cat.name}`}><Edit className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => { if (confirm(`Delete "${cat.name}"?`)) remove.mutate({ id: cat.id }); }} className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-destructive" aria-label={`Delete ${cat.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="rounded-md border border-border/50 bg-muted/20 p-2.5">
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"><ImageIcon className="h-3.5 w-3.5 text-primary" />Home category promotion</div>
                          <select
                            aria-label={`Promoted product for ${cat.name}`}
                            value={cat.promotedProductId ?? "automatic"}
                            onChange={(event) => setPromotedProduct.mutate({ categoryId: cat.id, productId: event.target.value === "automatic" ? null : Number(event.target.value) })}
                            disabled={setPromotedProduct.isPending}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="automatic">Automatic image-backed selection</option>
                            {eligibleProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                          </select>
                          <p className="mt-1.5 text-xs text-muted-foreground">Only active products in this category with a primary image can be selected.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
