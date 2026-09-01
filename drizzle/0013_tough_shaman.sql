CREATE TABLE `shipment_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`trackingReference` varchar(128) NOT NULL,
	`providerEventId` varchar(128),
	`providerStatus` varchar(64) NOT NULL,
	`normalizedStatus` enum('pending','packed','dispatched','in_transit','out_for_delivery','delivered','returned') NOT NULL,
	`message` varchar(512),
	`location` varchar(255),
	`occurredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipment_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `trackingProvider` varchar(64);--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `trackingLastCheckedAt` timestamp;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `trackingLastError` varchar(512);--> statement-breakpoint
ALTER TABLE `shipment_tracking_events` ADD CONSTRAINT `shipment_tracking_events_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;