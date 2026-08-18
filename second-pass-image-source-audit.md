# Second-Pass Catalogue Image Source Audit

## Scope

The second-pass inventory contained **92 active catalogue products without a primary image** after promotional header removal.

## Research outcome

Parallel source research examined each record against manufacturer, supplier, distributor, and pharmacy pages. The import policy accepts only a direct HTTPS image where the source confirms the exact product identity, strength, formulation, and meaningful pack details.

## Approved source set

Thirteen candidates were approved for import after variant review: HD Labs Aquaject 100, EquiJect 200, Heliosject, Cialis 5mg/30 count, Concerta 18mg/36mg/54mg, Dostinex 4 count, HD D3, HD ZMA, Mylan Alprazolam 100 count, BP Ostarine 10mg, and BP Levitra 20mg.

## Safeguards

The importer rejects non-HTTPS URLs, local derivative mirrors, duplicate existing primary images, stale/broken image responses, and sources outside the approved exact-match set. Several research results marked "verified" were excluded when a variant, pack size, strength, source accessibility, or brand correspondence was still not sufficiently established for this specific catalogue entry.

The remaining records are retained for review rather than being assigned a generic, duplicate, or mismatched image.

## Storefront verification

The second-pass S3-backed primary images were verified on the storefront for **Aquaject 100** and **BP Ostarine 10mg**. Both product detail pages displayed the assigned image together with the correct product name, category, description, price-gating state, and stock status.

## Import outcome

The validated import added **11** S3-backed primary images. The active catalogue now has **164 of 245** products with primary images, leaving **81** without an image.

The importer was run a second time after upload and produced **0 additional imports**, skipping the 11 established primary assignments. It retained 79 unresolved records and two source candidates whose direct image responses could not be safely retrieved.

The full regression suite passed with **140 tests**. The 21-test browser suite passed after the sandbox-restored Chromium dependency was installed.
