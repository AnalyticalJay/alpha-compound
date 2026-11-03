CREATE TABLE `payfast_itn_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payfastReference` varchar(255),
	`pfPaymentId` varchar(128),
	`merchantId` varchar(32),
	`paymentStatus` varchar(32) NOT NULL,
	`amountGross` decimal(10,2),
	`validationStatus` enum('pending','valid','invalid') NOT NULL DEFAULT 'pending',
	`processingStatus` enum('pending','processed','failed') NOT NULL DEFAULT 'pending',
	`failureReason` varchar(512),
	`retryCount` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payfast_itn_attempts_id` PRIMARY KEY(`id`)
);
