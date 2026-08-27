CREATE TABLE `watermark_settings` (
	`id` int NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`watermarkText` varchar(96) NOT NULL DEFAULT 'ANABOLICS AFRICA',
	`logoUrl` varchar(1024),
	`logoKey` varchar(512),
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watermark_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `watermark_settings` ADD CONSTRAINT `watermark_settings_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;