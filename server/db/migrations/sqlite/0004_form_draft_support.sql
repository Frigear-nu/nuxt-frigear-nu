ALTER TABLE `form_submissions` ADD `status` text DEFAULT 'submitted' NOT NULL;--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `completed_steps` integer DEFAULT 0 NOT NULL;
