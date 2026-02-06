CREATE TABLE `stripe_payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`type` text NOT NULL,
	`metadata` text NOT NULL,
	`card` text,
	FOREIGN KEY (`customer_id`) REFERENCES `stripe_customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `stripe_prices` ADD `lookup_key` text;--> statement-breakpoint
ALTER TABLE `stripe_prices` ADD `images` text;--> statement-breakpoint
ALTER TABLE `stripe_subscriptions` ADD `items` text;--> statement-breakpoint
ALTER TABLE `stripe_subscriptions` ADD `cancel_at` integer;--> statement-breakpoint
ALTER TABLE `stripe_subscriptions` ADD `cancellation_details` text;