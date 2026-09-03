CREATE TABLE `action_log` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`week` integer NOT NULL,
	`action_id` text NOT NULL,
	`label` text NOT NULL,
	`outcome` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `evidence_citations` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`exhibit_id` text NOT NULL,
	`citation_text` text NOT NULL,
	`title_span` text,
	`cited_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_exhibit_idx` ON `evidence_citations` (`team_id`,`exhibit_id`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`quiz_id` text NOT NULL,
	`week` integer NOT NULL,
	`score` integer NOT NULL,
	`max_score` integer NOT NULL,
	`answers` text NOT NULL,
	`completed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`passcode_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_name_unique` ON `teams` (`name`);--> statement-breakpoint
CREATE TABLE `week_action_state` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`week` integer NOT NULL,
	`trust_bonus` integer DEFAULT 0 NOT NULL,
	`actions_spent` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_week_idx` ON `week_action_state` (`team_id`,`week`);