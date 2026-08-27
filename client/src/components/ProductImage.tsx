import { cn } from "@/lib/utils";
import type { ImgHTMLAttributes } from "react";

type ProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "className" | "src"> & {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
  watermarkClassName?: string;
};

/**
 * Displays a catalogue image with a non-interactive, low-opacity brand overlay.
 * The watermark is rendered at display time so source images remain intact for
 * administration, exports, and future reuse.
 */
export default function ProductImage({
  src,
  alt,
  wrapperClassName,
  imageClassName,
  watermarkClassName,
  ...imageProps
}: ProductImageProps) {
  return (
    <div
      className={cn("relative isolate h-full w-full overflow-hidden [container-type:inline-size]", wrapperClassName)}
      data-product-image="watermarked"
    >
      <img
        {...imageProps}
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center overflow-hidden"
        data-product-watermark="anabolics-africa"
      >
        <span
          className={cn(
            "block -rotate-[27deg] whitespace-nowrap border-y border-white/20 bg-black/15 px-[13cqw] py-[0.45em] text-[clamp(7px,7cqw,24px)] font-black uppercase leading-none tracking-[0.26em] text-white/35 [text-shadow:0_1px_8px_rgba(0,0,0,0.72)]",
            watermarkClassName,
          )}
        >
          Anabolics Africa
        </span>
      </div>
    </div>
  );
}
