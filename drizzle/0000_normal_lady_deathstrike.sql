CREATE TABLE `locked_seats` (
	`show_id` text NOT NULL,
	`seat_id` text NOT NULL,
	`locked_session_id` text NOT NULL,
	`locked_until` integer NOT NULL,
	`stripe_checkout_session_id` text,
	PRIMARY KEY(`show_id`, `seat_id`)
);

CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);

CREATE TABLE `purchased_seats` (
	`show_id` text NOT NULL,
	`seat_id` text NOT NULL,
	`purchase_id` text NOT NULL,
	PRIMARY KEY(`show_id`, `seat_id`),
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`)
);

CREATE INDEX `stripeCheckoutSessionId` ON `locked_seats` (`stripe_checkout_session_id`);
CREATE INDEX `purchaseIdIdx` ON `purchased_seats` (`purchase_id`);
