# Official Google Measurement Setup Sources

## Search Console ownership

Google states that verified owners receive the highest level of Search Console permissions. Supported verification paths include HTML file upload, HTML tag, Google Analytics tracking code, Google Tag Manager, and domain-name-provider verification. A Domain property requires domain-provider verification and covers protocol and subdomain variations. Google recommends keeping more than one valid verification method because verification remains valid only while Google can confirm the token. Source: https://support.google.com/webmasters/answer/9008080?hl=en

## Sitemap discovery and monitoring

Google recommends sitemap files contain fully-qualified canonical URLs, be UTF-8 encoded, and be hosted at the site root when they should affect the whole site. Sitemap submission is a hint rather than a guarantee, but submitting through Search Console enables monitoring of Googlebot access and processing errors. Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Search Console operating model

Google’s starting sequence is: verify ownership, review whether Google can find and read pages, submit a sitemap if appropriate, and monitor Search performance. The documentation identifies Index Coverage, URL Inspection, Security Issues, and Core Web Vitals as relevant operational reports. Source: https://developers.google.com/search/docs/monitor-debug/search-console-start

## Core Web Vitals

Search Console’s Core Web Vitals report is based on field data. It groups URLs by LCP, INP, and CLS status; a property may show no data until enough CrUX data is available. Google’s listed Good thresholds are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Source: https://support.google.com/webmasters/answer/9205520?hl=en

## GA4 web stream setup

Google’s GA4 setup process requires an Analytics account/property, a Web data stream, and a Google tag deployed directly, through a CMS, or with Google Tag Manager. The Measurement ID is the identifier for a web stream and uses the `G-` format. The account owner needs the appropriate account/property role to create properties, streams, or view the Measurement ID. Sources: https://support.google.com/analytics/answer/9304153?hl=en and https://support.google.com/analytics/answer/12270356?hl=en

## Combined measurement

Google describes Search Console as the source for pre-click Google Search activity such as impressions, clicks, and queries, while GA4 measures on-site visitor behaviour. Google notes Search Console clicks and GA4 sessions do not match exactly, but their trend patterns can be compared. The recommended organic monitoring set includes GA4 sessions and engagement rate plus Search Console clicks and CTR. Source: https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console
