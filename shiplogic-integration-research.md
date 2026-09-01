# Shiplogic Integration Research

**Source reviewed:** 1 September 2026

Shiplogic documents a REST API that returns JSON and uses Bearer Token authentication. A production API key is created by the account owner under **Integrations > API Keys**; production credentials must be created for the relevant production account and should not be reused from the sandbox. The token must be sent in the `Authorization: Bearer <token>` request header.

The tracking operation is:

`GET https://api.shiplogic.com/tracking/shipments?tracking_reference=<waybill-or-tracking-reference>`

The response includes a shipment status and an array of tracking events. Shiplogic states that `parcel_id: 0` represents the shipment-level status, while a positive `parcel_id` identifies the relevant parcel. The documented status vocabulary includes `submitted`, `collected`, `at-hub`, `in-transit`, `at-destination-hub`, `out-for-delivery`, `delivery-exception`, `delivery-failed-attempt`, `ready-for-pickup`, `delivered`, `cancelled`, and return/collection states. The application should normalize provider statuses to its existing `pending`, `packed`, `dispatched`, `in_transit`, `out_for_delivery`, `delivered`, and `returned` timeline values, retaining the raw provider status for administrator diagnostics.

For the credential-ready phase, the application should implement server-side requests only, never expose the token to client code, use a paid-order-only administrator lookup, validate and bound the tracking-reference input, avoid excessive requests, persist a safe latest status and event history, and preserve the current manual waybill workflow when the API is unavailable. Provider-side webhook automation is a later phase and is not required for the initial manual-refresh rollout.

## Official References

- https://shiplogic.com/api-docs
- https://www.shiplogic.com/api-docs/authentication
- https://www.shiplogic.com/api-docs/get-tracking-a-shipment
- https://www.shiplogic.com/api-docs/shipment-statuses
