import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const checkout = readFileSync(resolve(process.cwd(), "client/src/pages/Checkout.tsx"), "utf8");
const autocomplete = readFileSync(resolve(process.cwd(), "client/src/components/AddressAutocompleteInput.tsx"), "utf8");

describe("checkout delivery address autocomplete", () => {
  it("uses the existing maps proxy and restricts suggestions to South Africa", () => {
    expect(autocomplete).toContain('const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`');
    expect(autocomplete).toContain('maps/api/js?key=${API_KEY}&v=weekly&libraries=places');
    expect(autocomplete).toContain('componentRestrictions: { country: "za" }');
    expect(autocomplete).toContain('types: ["address"]');
    expect(autocomplete).toContain('fields: ["formatted_address", "address_components"]');
  });

  it("maps a selected place into the courier-relevant checkout fields", () => {
    expect(autocomplete).toContain("addressLine1: [streetNumber, route]");
    expect(autocomplete).toContain("postalCode");
    expect(autocomplete).toContain("city");
    expect(checkout).toContain('setValue("addressLine1", address.addressLine1');
    expect(checkout).toContain('setValue("city", address.city');
    expect(checkout).toContain('setValue("postalCode", address.postalCode');
    expect(checkout).toContain('setValue("country", address.country');
  });

  it("keeps manual entry available and does not add an address to event parameters", () => {
    expect(autocomplete).toContain("or enter it manually");
    expect(checkout).toContain('placeholder="Start typing your street address"');
    expect(checkout).not.toContain("window.dataLayer");
    expect(checkout).not.toContain("analytics.track");
  });
});
