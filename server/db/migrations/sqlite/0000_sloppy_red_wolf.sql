CREATE TABLE `stripe_customers` (
	`stripe_customer_id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_idx` ON `stripe_customers` (`stripe_customer_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `stripe_prices` (
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
	FOREIGN KEY (`product_id`) REFERENCES `stripe_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stripe_products` (
	`id` text PRIMARY KEY NOT NULL,
	`active` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`metadata` text,
	`tax_code_id` text
);
--> statement-breakpoint
CREATE TABLE `stripe_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`metadata` text NOT NULL,
	`price_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`cancel_at_period_end` integer NOT NULL,
	`created` integer NOT NULL,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`ended_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `stripe_customers`(`stripe_customer_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`price_id`) REFERENCES `stripe_prices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`avatar` text,
	`created_at` integer,
	`last_login_at` integer,
	`is_migrated` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);