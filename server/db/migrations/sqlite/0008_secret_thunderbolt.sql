CREATE TABLE `user_roskilde_wristband` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`added_by` integer,
	`user_id` integer NOT NULL,
	`year` integer,
	`band_id` text,
	`band_serial` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `urwidx` ON `user_roskilde_wristband` (`user_id`,`year`);--> statement-breakpoint
CREATE UNIQUE INDEX `urwbidx` ON `user_roskilde_wristband` (`band_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `urwbsidx` ON `user_roskilde_wristband` (`band_serial`);--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `description` text;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `icon` text;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `priority` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `users` ADD `roskilde_people_id` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_roskilde_people_id_unique` ON `users` (`roskilde_people_id`);