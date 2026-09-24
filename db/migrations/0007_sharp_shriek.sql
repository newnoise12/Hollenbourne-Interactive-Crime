CREATE TABLE `cw2_mock_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`selected_item_ids` text,
	`responses` text DEFAULT '{}' NOT NULL,
	`synthesis` text,
	`synthesis_feedback` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_cw2_draft_idx` ON `cw2_mock_drafts` (`student_id`);