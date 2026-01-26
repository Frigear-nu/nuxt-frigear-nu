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
	FOREIGN KEY (`customer_id`) REFERENCES `stripe_customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`price_id`) REFERENCES `stripe_prices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_stripe_subscriptions`("id", "customer_id", "status", "metadata", "price_id", "quantity", "cancel_at_period_end", "created", "current_period_start", "current_period_end", "ended_at") SELECT "id", "user_id", "status", "metadata", "price_id", "quantity", "cancel_at_period_end", "created", "current_period_start", "current_period_end", "ended_at" FROM `stripe_subscriptions`;--> statement-breakpoint
DROP TABLE `stripe_subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_stripe_subscriptions` RENAME TO `stripe_subscriptions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;