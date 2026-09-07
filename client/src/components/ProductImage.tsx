import { cn } from "@/lib/utils";
import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { useWatermark } from "@/contexts/WatermarkContext";

const PRODUCT_FALLBACK_IMAGE = "/manus-storage/anabolics-africa-product-image-pending_8ff48682.png";

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
  const [displaySrc, setDisplaySrc] = useState(src);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [retriedPrimary, setRetriedPrimary] = useState(false);

  useEffect(() => {
    setDisplaySrc(src);
    setImageUnavailable(false);
    setRetriedPrimary(false);
  }, [src]);

  const handleImageError = () => {
    if (displaySrc === PRODUCT_FALLBACK_IMAGE) {
      setImageUnavailable(true);
      return;
    }
    if (!retriedPrimary) {
      const separator = src.includes("?") ? "&" : "?";
      setRetriedPrimary(true);
      setDisplaySrc(`${src}${separator}imageRetry=1`);
      return;
    }
    setDisplaySrc(PRODUCT_FALLBACK_IMAGE);
  };

  return (
    <div
      className={cn("relative isolate h-full w-full overflow-hidden [container-type:inline-size]", wrapperClassName)}
      data-product-image="watermarked"
    >
      {imageUnavailable ? (
        <div
          role="img"
          aria-label={`${alt} image unavailable`}
          data-image-status="unavailable"
          className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.16),_transparent_62%),#0D0D0D] px-5 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Image temporarily unavailable</span>
        </div>
      ) : (
        <img
          {...restImageProps}
          src={displaySrc}
          alt={alt}
          loading={loading ?? "lazy"}
          decoding={decoding ?? "async"}
          onError={handleImageError}
          data-image-status={displaySrc === PRODUCT_FALLBACK_IMAGE ? "fallback" : "primary"}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      )}
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
