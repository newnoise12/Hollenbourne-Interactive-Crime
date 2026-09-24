CREATE TABLE `module_settings` (
	`id` text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	`current_week` integer DEFAULT 1 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
