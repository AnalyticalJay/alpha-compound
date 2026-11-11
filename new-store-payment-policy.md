# Payment Policy

**Draft for legal review — South African online store**  
**Version:** 1.0  
**Effective date:** [DD Month YYYY]  
**Last updated:** [DD Month YYYY]

> **Important:** This is a practical drafting template, not legal advice and not a certification that the Store or its products may lawfully be sold or processed by a payment provider. Before publication, confirm the merchant account, payment-provider approval, product eligibility, gateway methods, bank details, refund workflows, chargeback handling, and applicable South African legal requirements. Complete every bracketed placeholder before publishing.

## 1. Scope and merchant details

This Payment Policy explains how customers may pay for accepted quotes and orders placed through **[domain]**, operated by **[full legal entity name]**, trading as **[store name]** (“we”, “us”, “our” or the “Store”). It must be read with the Terms of Use, Privacy Policy, and Shipping, Delivery and Returns Policy.

Store details:

- Legal name: **[full legal entity name]**
- Registration number: **[number]**
- Physical address: **[address]**
- Customer-service email: **[email]**
- Telephone: **[telephone]**
- Payment support email: **[payment email]**
- VAT number, if applicable: **[number / not registered]**

The Store will accept payments only for products and transactions that are lawful, properly described, permitted by our licences and approved by the relevant payment provider.

## 2. Currency

All Store prices, quotes, invoices, delivery charges, refunds and payment records are stated in **South African Rand (ZAR)** unless the accepted order expressly says otherwise.

PayFast’s developer documentation describes the payment notification amount fields as amounts paid in ZAR.[1] If a customer’s bank card or account is denominated in another currency, the customer’s bank or card issuer may apply its own conversion rate and fees. The Store does not control those charges.

## 3. Accepted payment methods

Subject to availability, customer eligibility and the provider’s approval, the Store accepts the following methods:

### 3.1 PayFast online checkout

Customers may be redirected to **PayFast by Network** to complete payment through the payment methods enabled on the Store’s approved PayFast merchant account. The currently enabled methods are:

- **[credit and cheque cards — enabled / not enabled]**
- **[Instant EFT — enabled / not enabled]**
- **[other PayFast methods, such as Store Cards, SnapScan, Zapper or MoreTyme — list only if actually enabled]**

The payment page and provider terms will determine which method is available for a particular transaction. Do not assume that every PayFast method is available for every customer, card, bank or order.

PayFast states that its merchant refund feature supports refunds for several supported payment methods, including cards, Instant EFT, Store Cards, MoreTyme, SnapScan and Zapper, subject to the applicable account and transaction rules.[2]

### 3.2 EFT / bank transfer

Customers may pay by electronic funds transfer to the Store’s verified South African bank account:

- Account name: **[account name]**
- Bank: **[bank name]**
- Account type: **[type]**
- Account number: **[account number]**
- Branch code: **[branch code]**
- Reference format: **[order number / customer reference]**

Bank details will be displayed only in the secure customer account, accepted quote, invoice, or another official Store communication. We will never change bank details solely by an unsolicited email or message. If bank details appear to have changed, contact **[payment support email]** before paying.

An EFT is not confirmed when the customer starts a transfer or uploads a screenshot. The Store confirms an EFT only after checking its bank records and matching the amount, reference, payer and order. Customers must not send cash, cryptocurrency, card details, PINs, online-banking passwords or one-time passwords to the Store.

### 3.3 Proof of payment

Where the Store offers EFT proof-of-payment upload, the customer may upload a legible proof of payment through the secure account area. The document should show the transaction date, amount, reference and relevant bank confirmation, but customers should redact unnecessary account numbers or other information.

An administrator will review the proof against the Store’s bank records. The Store may reject or request a replacement document where it is incomplete, altered, unreadable, inconsistent with the order, or cannot be verified. Uploading proof does not change an order to “paid”.

## 4. Quote acceptance and when payment is due

The Store may use a quote-first process. A quote request is not an invoice and does not authorise payment. Payment is due only after the Store issues an accepted quote or payment request that states the amount, order reference, payment method and payment deadline.

A quote may expire after **[number] days** or on the date shown on the quote. The Store may require a new quote if stock, price, delivery charges, legal requirements or payment-provider availability changes.

A customer must not pay a person or account not identified in the accepted quote or official Store checkout. Payments made using another person’s account, a mismatched reference or an unauthorised method may be delayed or refunded after verification.

## 5. PayFast security and payment confirmation

PayFast’s official integration guidance requires the merchant to receive a server notification, return an HTTP 200 response to prevent retries, verify the notification signature, check that it came from a valid PayFast source, compare the expected amount with the notification amount, and perform a server-side validation request.[1]

The Store therefore treats a PayFast payment as confirmed only when the Store’s server has received and validated the provider notification and the payment matches the relevant order. A customer return to the Store, a browser message, an email, or a screenshot saying “successful” is not by itself conclusive proof of payment.

The Store may record the PayFast transaction reference, merchant payment ID, payment status, gross amount, fees, net amount, timestamp and validation result. We may display a pending state until the server confirmation is complete.

If PayFast does not reach the Store’s notification endpoint, the notification fails validation, the amount does not match, the transaction is cancelled, or the payment is later reversed, the order may remain unpaid or be placed on hold. PayFast’s documentation states that failed notification responses may be retried, so the Store may receive duplicate notifications and will process them idempotently.[1]

## 6. Secure handling of payment information

Customers enter online payment credentials on the payment provider’s secure payment page where the provider supports that flow. Unless expressly stated otherwise, the Store does not store complete card numbers, CVV values, online-banking passwords, PINs or one-time passwords.

The Store uses reasonable safeguards including HTTPS/TLS, access-controlled administrator accounts, password hashing, role-based permissions, payment-status validation, audit records, limited payment-data access, secure storage, logging and incident-response procedures. No online service can guarantee absolute security.

PayFast’s merchant terms require merchants to use approved payment services, maintain appropriate security and comply with applicable law, and also require website information such as the refund policy, contact details, transaction currency, delivery policy and payment-card security policy to be available to customers.[3]

Customers must not share passwords, PINs, card details or one-time passwords with Store staff. The Store will not request them by email, chat, telephone or social media.

## 7. Fraud prevention and verification

We may delay, decline, cancel or review a transaction where we detect a possible mismatch, duplicate payment, account compromise, unauthorised payment, suspicious activity, chargeback risk, sanctions or legal concern, or a conflict between customer, payer, delivery and order information.

We may request reasonable information needed to verify a transaction or refund. We will not request a customer’s full card credentials or online-banking password. If a transaction cannot be verified, we may return funds to the original payment source where reasonably practicable and where permitted by the provider and law.

The Store may share limited transaction and delivery information with payment providers, banks, fraud-prevention services, couriers, professional advisers, regulators and law enforcement where reasonably necessary and lawful. Further information appears in the Privacy Policy.

## 8. Payment errors, duplicates and failed payments

If payment is declined or remains pending, the customer should not repeatedly retry without checking the order status, because duplicate authorisations or payments may occur. Contact **[payment support email]** with the order reference and provider transaction reference.

If a customer is charged more than once for the same order, the Store will investigate and refund a verified duplicate payment using the original payment method where reasonably practicable.

If the Store receives an amount that cannot be matched to an order, we may place it in a suspense or reconciliation process and contact the payer for verification. Customers should retain their bank or provider confirmation until the payment is matched.

## 9. Refunds and reversals

Refunds are governed by the accepted order, the Shipping, Delivery and Returns Policy, the Terms of Use, applicable consumer law and the payment provider’s rules. Nothing in this Policy removes a statutory refund right.

Where a refund is approved or legally required, we normally refund the original payment method. EFT refunds are made to the verified account used for the payment or another account confirmed through a secure verification process. We do not refund to an unrelated third party merely because a different account is requested by email.

PayFast provides a merchant-dashboard refund facility for full or partial refunds of supported payment methods, subject to its terms and fees.[2] A provider processing fee may apply to the Store; the Store will not deduct a fee from a customer’s statutory refund unless a lawful basis exists and the deduction is permitted.

Refund timing depends on the payment method, provider, bank and statutory deadline. We will initiate an approved refund within **[number] business days** or the shorter period required by law, and will tell the customer if provider processing time may delay receipt.

A payment reversal, chargeback, bank recall or fraud finding may place the order on hold. The Store may provide transaction evidence to the payment provider and may suspend fulfilment or account access while the matter is resolved.

## 10. Payment disputes and chargebacks

Customers should contact **[payment support email]** promptly if they do not recognise a payment, believe the amount is wrong, or have not received an expected refund. This gives the Store an opportunity to investigate and resolve the matter.

Nothing in this section prevents a customer from exercising a lawful right to dispute a payment with a bank, card issuer, payment provider, regulator or court. The Store will respond to provider disputes truthfully and within the required time.

## 11. Transaction records and invoices

The Store keeps an electronic record of accepted quotes, orders, invoices, payment status, payment-provider references, refunds, EFT proofs and relevant communications for the period required by law and our retention schedule.

Customers may request a copy of an order or invoice by contacting **[email]**. Invoices and receipts will identify the Store, order date, products, quantities, unit prices, delivery charge, taxes where applicable, total amount and payment status.

## 12. Direct debit and recurring payments

The Store does not take recurring payments or debit a customer’s account unless the customer has been clearly informed and has provided the legally required authority. Current recurring-payment status: **[not offered / describe the approved recurring process]**.

## 13. Changes to payment methods

We may add, remove or temporarily disable a payment method because of provider approval, maintenance, fraud risk, legal requirements, product eligibility or technical availability. An accepted order will not be changed retrospectively without the customer’s agreement unless the law or a provider requirement requires action.

## 14. Complaints and contact

For payment questions or disputes, contact:

**[Full legal entity name]**  
Payment support: **[email]**  
Customer service: **[email]**  
Telephone: **[number]**  
Physical address: **[address]**  
Hours: **[hours]**

Please include your order number, date, amount, payment method and provider transaction reference. Never include a full card number, CVV, PIN, password or one-time password.

## 15. Publication checklist

Before publishing this Policy, confirm that the Store has:

- completed all legal-entity, tax, contact and bank-account placeholders;
- confirmed that PayFast has approved the exact business, product category, domain and production URLs;
- listed only PayFast payment methods actually enabled on the merchant account;
- verified the live merchant ID and merchant key pairing without exposing credentials in the browser or repository;
- configured the PayFast notification endpoint, signature validation, amount matching, server validation and idempotent payment updates;
- created a safe EFT proof-upload and administrator-verification workflow;
- documented refund, reversal, chargeback and duplicate-payment handling;
- published the Terms, Privacy Policy, Shipping/Returns Policy and contact details at or before checkout;
- confirmed ZAR pricing, invoice and tax treatment with the accountant or tax adviser; and
- obtained written legal and payment-provider approval for the final product catalogue and transaction model.

## References

[1]: https://developers.payfast.co.za/ "PayFast developer documentation — notifications, security checks, payment status and server validation"
[2]: https://payfast.io/features/merchant-refund/ "PayFast Merchant Refund — supported methods and refund process"
[3]: https://payfast.io/legal/general-terms-conditions/ "PayFast General Terms and Conditions — merchant website, security, currency and compliance obligations"
[4]: https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf "Electronic Communications and Transactions Act 25 of 2002 — online supplier and payment-security requirements"
