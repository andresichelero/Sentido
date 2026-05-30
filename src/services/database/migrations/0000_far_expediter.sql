CREATE TABLE `local_checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`checked_at` integer NOT NULL,
	`emotions` text NOT NULL,
	`context` text,
	`note` text,
	`entry_mode` text NOT NULL,
	`valence_score` integer,
	`arousal_score` integer,
	`body_regions` text,
	`reflection` text,
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `local_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`plan` text DEFAULT 'free',
	`onboarding_completed` integer DEFAULT false,
	`updated_at` integer
);
