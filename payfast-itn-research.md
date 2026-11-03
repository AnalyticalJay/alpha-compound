# PayFast ITN findings

- Official documentation: https://developers.payfast.co.za/docs#itn
- PayFast says the notify endpoint should return HTTP 200 to prevent retries. If no 200 is returned, the notification is resent immediately, then after 10 minutes and at exponentially longer intervals.
- The ITN security checks include: verify the signature over all posted fields before the signature field, validate the merchant/payment data, and perform a server request to the provider.
- Live server validation endpoint: https://www.payfast.co.za/eng/query/validate
- The official example posts the URL-encoded callback parameters excluding the signature and accepts the response `VALID`.
- PayFast documents `m_payment_id`, `pf_payment_id`, `payment_status`, `amount_gross`, and `merchant_id` among the callback fields.
- Current app before this repair verified the local signature and merchant and directly called updateOrderPayment, but did not call the official server validation endpoint and had no durable callback-attempt/retry record.
