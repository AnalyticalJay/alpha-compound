import { forwardRef, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceResult = {
  formatted_address?: string;
  address_components?: AddressComponent[];
};

export type SelectedAddress = {
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
};

type AddressAutocompleteInputProps = {
  name: string;
  value?: string;
  placeholder?: string;
  className?: string;
  describedBy?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onAddressSelected: (address: SelectedAddress) => void;
};

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;
let mapsScriptPromise: Promise<void> | null = null;

function loadGooglePlacesScript() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-anabolics-google-places="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Address suggestions could not be loaded")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.dataset.anabolicsGooglePlaces = "true";
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Address suggestions could not be loaded"));
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

function componentValue(components: AddressComponent[], type: string) {
  return components.find((component) => component.types.includes(type))?.long_name ?? "";
}

function buildSelectedAddress(place: PlaceResult): SelectedAddress {
  const components = place.address_components ?? [];
  const streetNumber = componentValue(components, "street_number");
  const route = componentValue(components, "route");
  const subpremise = componentValue(components, "subpremise");
  const city = componentValue(components, "locality") || componentValue(components, "postal_town") || componentValue(components, "administrative_area_level_2");
  const postalCode = componentValue(components, "postal_code");
  const country = componentValue(components, "country") || "South Africa";
  const formattedAddress = place.formatted_address ?? [streetNumber, route, city, postalCode].filter(Boolean).join(", ");

  return {
    formattedAddress,
    addressLine1: [streetNumber, route].filter(Boolean).join(" ") || formattedAddress,
    addressLine2: subpremise,
    city,
    postalCode,
    country,
  };
}

export const AddressAutocompleteInput = forwardRef<HTMLInputElement, AddressAutocompleteInputProps>(function AddressAutocompleteInput({
  name,
  value,
  placeholder,
  className,
  describedBy,
  onChange,
  onBlur,
  onAddressSelected,
}, ref) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<"loading" | "available" | "unavailable">("loading");

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;
    let cancelled = false;

    loadGooglePlacesScript()
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return;
        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "za" },
          fields: ["formatted_address", "address_components"],
        });
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace() as PlaceResult | undefined;
          if (place?.formatted_address || place?.address_components?.length) {
            onAddressSelected(buildSelectedAddress(place));
          }
        });
        setStatus("available");
      })
      .catch(() => {
        mapsScriptPromise = null;
        setStatus("unavailable");
      });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [onAddressSelected]);

  return (
    <div className="relative">
      <Input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="street-address"
        aria-describedby={describedBy}
        className={cn("mt-1.5 bg-input border-border", className)}
      />
      <p className="mt-1 text-[11px] text-muted-foreground" aria-live="polite">
        {status === "available" ? "Start typing to choose a verified South African address, or enter it manually." : status === "loading" ? "Loading address suggestions…" : "Address suggestions are unavailable; you can enter the address manually."}
      </p>
    </div>
  );
});
