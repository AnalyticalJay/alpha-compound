# Shiplogic booking research

Shiplogic's official API documentation lists `POST https://api.shiplogic.com/shipments` for creating a shipment. The required fields are `collection_address`, `collection_contact`, `delivery_address`, `delivery_contact`, `parcels`, and either `service_level_code` or `service_level_id`. Contacts need at least an email address or mobile number. The official example includes parcel dimensions in centimetres and weight in kilograms, `customer_reference`, `customer_reference_name`, `declared_value`, and `mute_notifications`. Source: https://shiplogic.com/api-docs/post-create-a-shipment

Shiplogic's official platform page describes the product as covering quote, booking, tracking, customer notifications, and API integrations. Source: https://shiplogic.com/platform

Shiplogic's official webhook documentation shows tracking-event payloads with a shipment-level tracking reference, shipment ID, current status, event time, and nested tracking events. It says account owners configure webhook subscriptions under Settings > Webhook subscriptions. Source: https://shiplogic.com/api-docs/webhooks

Shiplogic's official shipment-status documentation lists `submitted`, collection statuses, hub/transit statuses, delivery statuses including `out-for-delivery`, `delivered`, and return/failure statuses. Source: https://shiplogic.com/api-docs/shipment-statuses

The app currently has tracking lookup and admin waybill persistence, but not shipment creation. The new booking client therefore requires server-only configuration for the collection address/contact, service level code, and parcel dimensions/weight. It fails closed when those fields are absent and never sends a booking request in that state.
