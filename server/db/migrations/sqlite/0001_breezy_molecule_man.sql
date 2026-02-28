CREATE TABLE `user_event_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`event_path` text NOT NULL,
	`user_id` integer NOT NULL,
	`checkout_session_id` text,
	`ticket_key` text NOT NULL,
	`stripe_id` text,
	`price_ids` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_at` integer,
	`abandoned_at` integer,
	`cancelled_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
