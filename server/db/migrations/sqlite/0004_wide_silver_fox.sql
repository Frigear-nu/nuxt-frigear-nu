CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`amount` real NOT NULL,
	`description` text,
	`attachments` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
