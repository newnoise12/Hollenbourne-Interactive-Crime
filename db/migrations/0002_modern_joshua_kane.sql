CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`team_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_student_name_idx` ON `students` (`team_id`,`name`);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `student_id` text NOT NULL REFERENCES students(id);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `team_id_at_attempt` text NOT NULL REFERENCES teams(id);