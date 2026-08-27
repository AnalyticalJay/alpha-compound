import { useEffect, useRef, useState } from "react";
import { FileImage, ImagePlus, Loader2, Stamp, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";

const MAX_LOGO_BYTES = 8 * 1024 * 1024;

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",", 2)[1] : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read logo"));
    reader.readAsDataURL(file);
  });
}

export default function AdminWatermark() {
  const fileRef = useRef<HTMLInputElement>(null);
  const settingsQuery = trpc.watermark.get.useQuery();
  const utils = trpc.useUtils();
  const settings = settingsQuery.data;
  const [watermarkText, setWatermarkText] = useState("");

  useEffect(() => {
    if (settings?.watermarkText) setWatermarkText(settings.watermarkText);
  }, [settings?.watermarkText]);

  const updateSettings = trpc.watermark.update.useMutation({
    onSuccess: (nextSettings) => {
      utils.watermark.get.setData(undefined, nextSettings);
      toast.success("Watermark settings saved");
    },
    onError: (error) => toast.error(error.message || "Could not save watermark settings"),
  });
  const uploadLogo = trpc.watermark.uploadLogo.useMutation({
    onSuccess: (nextSettings) => {
      utils.watermark.get.setData(undefined, nextSettings);
      toast.success("Custom watermark logo uploaded");
    },
    onError: (error) => toast.error(error.message || "Could not upload watermark logo"),
  });
  const removeLogo = trpc.watermark.removeLogo.useMutation({
    onSuccess: (nextSettings) => {
      utils.watermark.get.setData(undefined, nextSettings);
      toast.success("Custom logo removed; text watermark restored");
    },
    onError: (error) => toast.error(error.message || "Could not remove watermark logo"),
  });

  const saveText = () => {
    const text = watermarkText.trim();
    if (text.length < 2) {
      toast.error("Watermark text must contain at least two characters");
      return;
    }
    updateSettings.mutate({ watermarkText: text });
  };

  const selectLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      toast.error("Use a PNG or JPEG watermark logo");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("The watermark logo must be 8 MB or smaller");
      return;
    }

    try {
      uploadLogo.mutate({
        fileName: file.name,
        fileData: await fileToBase64(file),
        mimeType: file.type as "image/png" | "image/jpeg",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read watermark logo");
    }
  };

  if (settingsQuery.isLoading) {
    return <div className="space-y-4"><div className="h-24 animate-pulse rounded-xl bg-[#111111]" /><div className="h-72 animate-pulse rounded-xl bg-[#111111]" /></div>;
  }

  const isEnabled = settings?.isEnabled ?? true;
  const hasLogo = Boolean(settings?.logoUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0EA5E9]">Catalogue protection</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Product Image Watermark</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">Manage one subtle overlay across the live catalogue without changing the original product-image files.</p>
        </div>
        <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${isEnabled ? "border-[#10B981]/35 bg-[#10B981]/10 text-[#A7F3D0]" : "border-[#64748B]/35 bg-[#64748B]/10 text-[#CBD5E1]"}`}>
          <span className={`h-2 w-2 rounded-full ${isEnabled ? "bg-[#10B981]" : "bg-[#64748B]"}`} />
          {isEnabled ? "Watermark enabled" : "Watermark disabled"}
        </div>
      </div>

      <section className="rounded-xl border border-[#0EA5E9]/35 bg-[#0EA5E9]/5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0EA5E9]/15 text-[#38BDF8]"><Stamp className="h-5 w-5" /></span>
            <div className="min-w-0"><h2 className="font-black text-white">Enable across the site</h2><p className="mt-1 text-sm leading-relaxed text-[#94A3B8]">When switched off, product images remain visible but no text or logo overlay is displayed.</p></div>
          </div>
          <Switch aria-label="Enable product image watermark across the site" checked={isEnabled} disabled={updateSettings.isPending} onCheckedChange={(enabled) => updateSettings.mutate({ isEnabled: enabled })} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-[#1E293B] bg-[#111111] p-4 sm:p-6">
          <div className="mb-5 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E11D48]/15 text-[#FDA4AF]"><Stamp className="h-5 w-5" /></span><div><h2 className="font-black text-white">Text watermark</h2><p className="mt-1 text-sm text-[#94A3B8]">This is the default overlay. It is restored automatically when no custom logo is active.</p></div></div>
          <Label htmlFor="watermark-text" className="text-sm font-bold text-white">Watermark text</Label>
          <Input id="watermark-text" value={watermarkText} maxLength={96} onChange={(event) => setWatermarkText(event.target.value)} className="mt-2 min-h-11 border-[#1E293B] bg-[#090909] text-white" placeholder="ANABOLICS AFRICA" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-relaxed text-[#64748B]">Keep wording concise for small catalogue thumbnails.</p><Button type="button" onClick={saveText} disabled={updateSettings.isPending || watermarkText.trim().length < 2} className="min-h-11 bg-[#0EA5E9] font-bold uppercase tracking-wide text-white hover:bg-[#0284C7]">{updateSettings.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</> : "Save text"}</Button></div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111111] p-4 sm:p-6">
          <div className="mb-5 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0EA5E9]/15 text-[#38BDF8]"><ImagePlus className="h-5 w-5" /></span><div><h2 className="font-black text-white">Custom logo</h2><p className="mt-1 text-sm text-[#94A3B8]">A custom logo replaces the text overlay until removed. A transparent PNG is recommended.</p></div></div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={selectLogo} disabled={uploadLogo.isPending} />
          {hasLogo ? (
            <div className="rounded-lg border border-[#1E293B] bg-[#090909] p-4">
              <div className="flex min-h-28 items-center justify-center overflow-hidden rounded border border-dashed border-[#1E293B] bg-black/25 p-3"><img src={settings?.logoUrl ?? ""} alt="Current custom watermark logo" className="max-h-24 max-w-full object-contain opacity-70" /></div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending || removeLogo.isPending} className="min-h-11 flex-1 border-[#1E293B] text-[#94A3B8] hover:bg-white/5 hover:text-white"><UploadCloud className="mr-2 h-4 w-4" />Replace</Button><Button type="button" variant="outline" onClick={() => removeLogo.mutate()} disabled={removeLogo.isPending || uploadLogo.isPending} className="min-h-11 flex-1 border-[#E11D48]/35 text-[#FDA4AF] hover:bg-[#E11D48]/10 hover:text-white">{removeLogo.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Remove logo</Button></div>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending} className="flex min-h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#0EA5E9]/50 bg-[#0EA5E9]/5 px-5 text-center transition-colors hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/10 disabled:cursor-not-allowed disabled:opacity-60"><FileImage className="mb-3 h-8 w-8 text-[#0EA5E9]" />{uploadLogo.isPending ? <><Loader2 className="mb-2 h-5 w-5 animate-spin text-white" /><span className="text-sm font-bold uppercase tracking-wide text-white">Uploading logo</span></> : <><span className="text-sm font-bold uppercase tracking-wide text-white">Upload a custom logo</span><span className="mt-1 text-xs text-[#64748B]">PNG or JPEG, maximum 8 MB</span></>}</button>
          )}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-lg border border-[#1E293B] bg-[#090909] p-4 text-sm leading-relaxed text-[#94A3B8]"><Stamp className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]" /><p>All controls affect product imagery across the customer catalogue, product detail pages, quote cart, homepage product promotions, and administrator product views. The overlay is applied at display time, so source images remain unchanged.</p></div>
    </div>
  );
}
