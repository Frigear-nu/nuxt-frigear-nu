CREATE TABLE `magic_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`code` text NOT NULL,
	`redirect_url` text,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `magic_links_code_unique` ON `magic_links` (`code`);--> statement-breakpoint
CREATE TABLE `oauth_apps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_resets_code_unique` ON `password_resets` (`code`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stripe_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_idx` ON `stripe_customers` (`id`,`user_id`);--> statement-breakpoint
CREATE TABLE `stripe_payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`type` text NOT NULL,
	`metadata` text NOT NULL,
	`card` text,
	FOREIGN KEY (`customer_id`) REFERENCES `stripe_customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stripe_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`active` integer NOT NULL,
	`description` text,
	`unit_amount` integer NOT NULL,
	`currency` text NOT NULL,
	`type` text NOT NULL,
	`interval` text NOT NULL,
	`interval_count` integer NOT NULL,
	`trial_period_days` integer NOT NULL,
	`lookup_key` text,
	`images` text,
	`metadata` text,
	FOREIGN KEY (`product_id`) REFERENCES `stripe_products`(`id`) ON UPDATE no action ON DELETE cascade
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
	`customer_id` text,
	`status` text NOT NULL,
	`metadata` text NOT NULL,
	`price_id` text,
	`items` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`cancel_at_period_end` integer NOT NULL,
	`cancel_at` integer,
	`cancellation_details` text,
	`created` integer NOT NULL,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`ended_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `stripe_customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`price_id`) REFERENCES `stripe_prices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`avatar_url` text,
	`is_migrated` integer DEFAULT false NOT NULL,
	`supabase_id` text,
	`supabase_provider` text,
	`last_login_at` integer,
	`email_verified_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);