ALTER TABLE `oauth_clients` ADD `tags` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `users` ADD `accessTags` text DEFAULT '[]';