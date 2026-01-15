CREATE TABLE `stripe_customers` (
	`userId` integer PRIMARY KEY NOT NULL,
	`stripe_customer_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_idx` ON `stripe_customers` (`stripe_customer_id`,`userId`);