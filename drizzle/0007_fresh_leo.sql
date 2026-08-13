ALTER TABLE `shipping_details` ADD `courierName` varchar(128);--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `trackingNumber` varchar(128);--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `trackingUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `shippingStatus` enum('pending','packed','dispatched','in_transit','delivered','returned') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `shippedAt` timestamp;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `deliveredAt` timestamp;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `shippingNotes` text;