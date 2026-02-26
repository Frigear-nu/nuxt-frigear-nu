CREATE TABLE `form_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`data` text NOT NULL,
	`files` text NOT NULL,
	`delivery` text DEFAULT '[]' NOT NULL,
	`delivered_at` integer,
	`created_at` integer NOT NULL
);
