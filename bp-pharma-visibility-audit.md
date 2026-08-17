# BP Pharma Storefront Image Visibility Audit

## Initial findings — 17 August 2026

The database currently contains **113 BP Pharma products**. Of those, **56 products have primary images**, and all 56 primary-image URLs use the secure `/manus-storage/` delivery path.

The refreshed development storefront was checked at `/products/bp-anapolin-25mg`. Its confirmed primary supplier image, `/manus-storage/products/bp-pharma/supplier/bp-anapolin-25mg_94b2e93a.png`, loaded and rendered correctly on the public product-detail page.

The published custom-domain catalogue at `https://anabolicsafrica.co.za/products` successfully loads its product cards and image-backed HD Labs cards. The BP Pharma primary-image records are present in the catalogue response but are not visible above the fold because the catalogue is ordered by featured status and then source creation order, which currently places many HD Labs records first.

The published catalogue was then filtered to **BP Pharma**. The resulting 113-product view visibly renders the implemented primary images on the matching cards, including **BP Anapolin 25mg**, **BP Anavar 20mg**, **BP Anavar 5mg**, **BP AQ Test 100mg**, **BP AQ Winstrol 50mg**, **BP Bold C 200mg**, and **BP Cheque Drops 250mcg**. Their image URLs resolve through `/manus-storage/` correctly.

## Conclusion

The supplier-image extraction was implemented successfully and there is no current image-delivery or rendering failure for mapped BP Pharma products. There are **56 BP products with verified primary images**: 47 Body Pharm supplier listings and 9 previously supplied peptide images. The remaining 57 BP products do not have verified source imagery yet, so their cards intentionally show the standard no-image treatment. Because the full catalogue starts with HD Labs records, BP Pharma images are easiest to inspect by selecting the **BP Pharma** brand filter.

To make that route immediately visible, the catalogue now includes a top-level **Browse BP Pharma** shortcut alongside the HD Labs shortcut. It was verified in the refreshed development storefront: activating it changes the active state to **Showing BP Pharma** and displays the matching image-backed BP cards, including BP Anapolin 25mg, BP Anavar 20mg, BP AQ Test 100mg, and BP AQ Winstrol 50mg.
