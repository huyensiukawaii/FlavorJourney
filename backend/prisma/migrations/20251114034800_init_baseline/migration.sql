-- CreateTable

CREATE TABLE `users` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `email` VARCHAR(255) NOT NULL,

    `password` VARCHAR(255) NOT NULL,

    `username` VARCHAR(100) NOT NULL,

    `role` ENUM('user', 'admin') NULL DEFAULT 'user',

    `birthday` DATE NULL,

    `location` VARCHAR(255) NULL,

    `registration_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),   

    `consecutive_login_days` INTEGER NULL DEFAULT 0,

    `save_login_info` BOOLEAN NULL DEFAULT false,

    `last_login` DATETIME(0) NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    UNIQUE INDEX `email`(`email`),

    INDEX `idx_email`(`email`),

    INDEX `idx_role`(`role`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `regions` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `name_japanese` VARCHAR(100) NOT NULL,

    `name_vietnamese` VARCHAR(100) NOT NULL,

    `code` VARCHAR(20) NOT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    UNIQUE INDEX `code`(`code`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `categories` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `name_japanese` VARCHAR(100) NOT NULL,

    `name_vietnamese` VARCHAR(100) NOT NULL,

    `slug` VARCHAR(100) NOT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    UNIQUE INDEX `slug`(`slug`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `taste_interests` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `name_japanese` VARCHAR(50) NOT NULL,

    `name_vietnamese` VARCHAR(50) NOT NULL,

    `slug` VARCHAR(50) NOT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    UNIQUE INDEX `slug`(`slug`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `user_taste_interests` (

    `user_id` INTEGER NOT NULL,

    `taste_id` INTEGER NOT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_taste`(`taste_id`),

    INDEX `idx_user`(`user_id`),

    PRIMARY KEY (`user_id`, `taste_id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `user_category_interests` (

    `user_id` INTEGER NOT NULL,

    `category_id` INTEGER NOT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_category`(`category_id`),

    INDEX `idx_user`(`user_id`),

    PRIMARY KEY (`user_id`, `category_id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `dishes` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `name_japanese` VARCHAR(255) NOT NULL,

    `name_vietnamese` VARCHAR(255) NOT NULL,

    `name_romaji` VARCHAR(255) NULL,

    `description_japanese` TEXT NULL,

    `description_vietnamese` TEXT NULL,

    `description_romaji` TEXT NULL,

    `image_url` VARCHAR(500) NULL,

    `category_id` INTEGER NULL,

    `region_id` INTEGER NULL,

    `spiciness_level` INTEGER NULL DEFAULT 0,

    `saltiness_level` INTEGER NULL DEFAULT 0,

    `sweetness_level` INTEGER NULL DEFAULT 0,

    `sourness_level` INTEGER NULL DEFAULT 0,

    `ingredients` TEXT NULL,

    `how_to_eat` TEXT NULL,

    `status` ENUM('pending', 'approved', 'rejected') NULL DEFAULT 'pending',

    `submitted_by` INTEGER NOT NULL,

    `reviewed_by` INTEGER NULL,

    `submitted_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),        

    `reviewed_at` DATETIME(0) NULL,

    `rejection_reason` TEXT NULL,

    `view_count` INTEGER NULL DEFAULT 0,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_category`(`category_id`),

    INDEX `idx_region`(`region_id`),

    INDEX `idx_reviewed_by`(`reviewed_by`),

    INDEX `idx_status`(`status`),

    INDEX `idx_submitted_by`(`submitted_by`),

    FULLTEXT INDEX `idx_search`(`name_japanese`, `name_vietnamese`, `description_japanese`, `description_vietnamese`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `favorites` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `user_id` INTEGER NOT NULL,

    `dish_id` INTEGER NOT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_dish`(`dish_id`),

    INDEX `idx_user`(`user_id`),

    UNIQUE INDEX `unique_favorite`(`user_id`, `dish_id`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `view_history` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `user_id` INTEGER NOT NULL,

    `dish_id` INTEGER NOT NULL,

    `viewed_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_dish`(`dish_id`),

    INDEX `idx_user`(`user_id`),

    INDEX `idx_viewed_at`(`viewed_at`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `template_groups` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `name_japanese` VARCHAR(100) NOT NULL,

    `name_vietnamese` VARCHAR(100) NOT NULL,

    `description` TEXT NULL,

    `display_order` INTEGER NULL DEFAULT 0,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_display_order`(`display_order`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `templates` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `group_id` INTEGER NULL,

    `japanese_text` TEXT NOT NULL,

    `vietnamese_text` TEXT NOT NULL,

    `romaji_text` TEXT NULL,

    `audio_url` VARCHAR(500) NULL,

    `usage_context` VARCHAR(255) NULL,

    `display_order` INTEGER NULL DEFAULT 0,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_display_order`(`display_order`),

    INDEX `idx_group`(`group_id`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- CreateTable

CREATE TABLE `saved_templates` (

    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `user_id` INTEGER NOT NULL,

    `dish_id` INTEGER NULL,

    `title` VARCHAR(255) NULL,

    `generated_text` TEXT NOT NULL,

    `context` TEXT NULL,

    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),



    INDEX `idx_dish`(`dish_id`),

    INDEX `idx_user`(`user_id`),

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- AddForeignKey

ALTER TABLE `user_taste_interests` ADD CONSTRAINT `user_taste_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `user_taste_interests` ADD CONSTRAINT `user_taste_interests_ibfk_2` FOREIGN KEY (`taste_id`) REFERENCES `taste_interests`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `user_category_interests` ADD CONSTRAINT `user_category_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `user_category_interests` ADD CONSTRAINT `user_category_interests_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `dishes` ADD CONSTRAINT `dishes_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `dishes` ADD CONSTRAINT `dishes_ibfk_2` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;  



-- AddForeignKey

ALTER TABLE `dishes` ADD CONSTRAINT `dishes_ibfk_3` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;  



-- AddForeignKey

ALTER TABLE `dishes` ADD CONSTRAINT `dishes_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;  



-- AddForeignKey

ALTER TABLE `favorites` ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION; 



-- AddForeignKey

ALTER TABLE `favorites` ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`dish_id`) REFERENCES `dishes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `view_history` ADD CONSTRAINT `view_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `view_history` ADD CONSTRAINT `view_history_ibfk_2` FOREIGN KEY (`dish_id`) REFERENCES `dishes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `templates` ADD CONSTRAINT `templates_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `template_groups`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `saved_templates` ADD CONSTRAINT `saved_templates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;



-- AddForeignKey

ALTER TABLE `saved_templates` ADD CONSTRAINT `saved_templates_ibfk_2` FOREIGN KEY (`dish_id`) REFERENCES `dishes`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

