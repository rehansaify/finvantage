CREATE TABLE `assessment_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`question` text NOT NULL,
	`type` text DEFAULT 'MCQ' NOT NULL,
	`options` text,
	`correct_answer` text,
	`points` integer DEFAULT 1 NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `assessment_results` ADD `answers` text;