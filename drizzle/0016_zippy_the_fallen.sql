ALTER TABLE `shipping_details` ADD `providerShipmentId` varchar(128);--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `bookingStatus` enum('not_requested','pending','booked','failed') DEFAULT 'not_requested' NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `bookingAttemptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `bookedAt` timestamp;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD `bookingLastError` varchar(512);