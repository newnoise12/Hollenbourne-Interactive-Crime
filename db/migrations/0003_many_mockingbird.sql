PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`team_id_at_attempt` text NOT NULL,
	`quiz_id` text NOT NULL,
	`week` integer NOT NULL,
	`score` integer NOT NULL,
	`max_score` integer NOT NULL,
	`answers` text NOT NULL,
	`completed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id_at_attempt`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_quiz_attempts`("id", "student_id", "team_id_at_attempt", "quiz_id", "week", "score", "max_score", "answers", "completed_at") SELECT "id", "student_id", "team_id_at_attempt", "quiz_id", "week", "score", "max_score", "answers", "completed_at" FROM `quiz_attempts`;--> statement-breakpoint
DROP TABLE `quiz_attempts`;--> statement-breakpoint
ALTER TABLE `__new_quiz_attempts` RENAME TO `quiz_attempts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;