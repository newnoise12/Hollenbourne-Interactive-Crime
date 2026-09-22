CREATE TABLE `evidence_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`from_pin_id` text NOT NULL,
	`to_pin_id` text NOT NULL,
	`label` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_pin_id`) REFERENCES `evidence_pins`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_pin_id`) REFERENCES `evidence_pins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `evidence_pins` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`exhibit_id` text NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`note` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_pin_exhibit_idx` ON `evidence_pins` (`team_id`,`exhibit_id`);--> statement-breakpoint
ALTER TABLE `teams` ADD `reserve_points` integer DEFAULT 0 NOT NULL;