PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_stripe_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`status` text NOT NULL,
	`metadata` text NOT NULL,
	`price_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`cancel_at_period_end` integer NOT NULL,
	`created` integer NOT NULL,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`ended_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `stripe_customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`price_id`) REFERENCES `stripe_prices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stripe_subscriptions`("id", "customer_id", "status", "metadata", "price_id", "quantity", "cancel_at_period_end", "created", "current_period_start", "current_period_end", "ended_at") SELECT "id", "user_id", "status", "metadata", "price_id", "quantity", "cancel_at_period_end", "created", "current_period_start", "current_period_end", "ended_at" FROM `stripe_subscriptions`;--> statement-breakpoint
DROP TABLE `stripe_subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_stripe_subscriptions` RENAME TO `stripe_subscriptions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_stripe_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stripe_customers`("id", "user_id") SELECT "id", "user_id" FROM `stripe_customers`;--> statement-breakpoint
DROP TABLE `stripe_customers`;--> statement-breakpoint
ALTER TABLE `__new_stripe_customers` RENAME TO `stripe_customers`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_idx` ON `stripe_customers` (`id`,`user_id`);--> statement-breakpoint
CREATE TABLE `__new_stripe_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`active` integer NOT NULL,
	`description` text,
	`unit_amount` integer NOT NULL,
	`currency` text NOT NULL,
	`type` text NOT NULL,
	`interval` text NOT NULL,
	`interval_count` integer NOT NULL,
	`trial_period_days` integer NOT NULL,
	`metadata` text,
	FOREIGN KEY (`product_id`) REFERENCES `stripe_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stripe_prices`("id", "product_id", "active", "description", "unit_amount", "currency", "type", "interval", "interval_count", "trial_period_days", "metadata") SELECT "id", "product_id", "active", "description", "unit_amount", "currency", "type", "interval", "interval_count", "trial_period_days", "metadata" FROM `stripe_prices`;--> statement-breakpoint
DROP TABLE `stripe_prices`;--> statement-breakpoint
ALTER TABLE `__new_stripe_prices` RENAME TO `stripe_prices`;