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
	`metadata` text
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
	`status` text NOT NULL,
	`metadata` text NOT NULL,
	`price_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`cancel_at_period_end` integer NOT NULL,
	`created` integer NOT NULL,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`ended_at` integer
);
