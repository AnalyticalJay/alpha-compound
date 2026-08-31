import { cn } from "@/lib/utils";
import type { ImgHTMLAttributes } from "react";
import { useWatermark } from "@/contexts/WatermarkContext";

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
  const { isEnabled, watermarkText, logoUrl } = useWatermark();
  const { loading, decoding, ...restImageProps } = imageProps;

  return (
    <div
      className={cn("relative isolate h-full w-full overflow-hidden [container-type:inline-size]", wrapperClassName)}
      data-product-image="watermarked"
    >
      <img
        {...restImageProps}
        src={src}
        alt={alt}
        loading={loading ?? "lazy"}
        decoding={decoding ?? "async"}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
      {isEnabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center overflow-hidden"
          data-product-watermark="anabolics-africa"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="block max-h-[62%] max-w-[72%] -rotate-[27deg] object-contain opacity-35 [filter:drop-shadow(0_1px_8px_rgba(0,0,0,0.72))]"
            />
          ) : (
            <span
              className={cn(
                "block -rotate-[27deg] whitespace-nowrap border-y border-white/20 bg-black/15 px-[13cqw] py-[0.45em] text-[clamp(7px,7cqw,24px)] font-black uppercase leading-none tracking-[0.26em] text-white/35 [text-shadow:0_1px_8px_rgba(0,0,0,0.72)]",
                watermarkClassName,
              )}
            >
              {watermarkText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
