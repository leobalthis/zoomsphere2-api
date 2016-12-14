SET NAMES utf8;
SET foreign_key_checks = 0;
SET time_zone = '+00:00';
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `share_user`;
CREATE TABLE `share_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `status` enum('wait','ok','false') NOT NULL DEFAULT 'wait' COMMENT 'nepouziva se',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`from_user_id`,`to_user_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  CONSTRAINT `FK_share_user_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_user_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni uzivatelu v tymu';


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` char(30) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `nick` varchar(100) DEFAULT NULL,
  `b2b_id` int(11) unsigned DEFAULT NULL,
  `date_logged` datetime DEFAULT NULL,
  `date_registered` datetime NOT NULL,
  `account` enum('facebook','twitter','zoomsphere','google') NOT NULL DEFAULT 'facebook',
  `userInfo` varchar(14000) DEFAULT NULL,
  `hash` char(10) DEFAULT NULL,
  `zoomsphereEmail` varchar(100) DEFAULT NULL,
  `googleAccountId` smallint(3) unsigned DEFAULT NULL,
  `facebookAccountId` smallint(3) unsigned DEFAULT NULL,
  `token` char(20) DEFAULT NULL,
  `tariff` char(20) DEFAULT NULL,
  `date_paid` datetime DEFAULT NULL,
  `tariff_charts` datetime DEFAULT NULL,
  `tariff_engagement_console` datetime DEFAULT NULL,
  `tariff_monitoring` datetime DEFAULT NULL,
  `tariff_publisher` datetime DEFAULT NULL,
  `tariff_contacts` datetime DEFAULT NULL,
  `tariff_social_inbox` datetime DEFAULT NULL,
  `tariff_whitelabel` datetime DEFAULT NULL,
  `period_check` datetime DEFAULT NULL,
  `whitelabel_user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL COMMENT 'urceno ke smazani',
  `demo` datetime DEFAULT NULL COMMENT 'aktivace demo na 7 dnu',
  `email` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `apitoken` char(36) DEFAULT NULL,
  `country` char(2) DEFAULT NULL,
  `timezone` char(30) DEFAULT NULL,
  `about` varchar(255) DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `image_big` varchar(255) DEFAULT 'https://www.zoomsphere.com/img/anonym.gif',
  `image_square` varchar(255) DEFAULT 'https://www.zoomsphere.com/img/anonym.gif',
  `state` enum('uncompleted','completed','temporary','unconfirmed email','deleted','forgotten_password') NOT NULL DEFAULT 'uncompleted',
  `role` enum('root','administrator') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `account_id_account` (`account_id`,`account`),
  KEY `b2b_catalog_id` (`b2b_id`),
  KEY `account` (`account_id`,`account`),
  KEY `googleAccountId` (`googleAccountId`),
  KEY `facebookAccountId` (`facebookAccountId`),
  KEY `whitelabel_user_id` (`whitelabel_user_id`),
  KEY `company_id` (`company_id`),
  KEY `status` (`status`),
  KEY `apitoken` (`apitoken`),
  FULLTEXT KEY `name` (`name`),
  KEY `state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='hlavni table user accountu';


DROP TABLE IF EXISTS `user_account`;
CREATE TABLE `user_account` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `account_id` char(40) NOT NULL,
  `account` enum('twitter','facebook','googleplus','google','linkedin','instagram') NOT NULL,
  `name` varchar(255) NOT NULL,
  `accountInfo` varchar(7000) DEFAULT NULL,
  `last_update` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `expires` datetime DEFAULT NULL,
  `invalid` tinyint(1) DEFAULT NULL,
  `last_used` datetime NOT NULL DEFAULT '2013-12-13 14:08:27',
  `image` varchar(500) NOT NULL,
  `access_token` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id2` (`user_id`,`account_id`,`account`),
  KEY `account2` (`account`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `account_id` (`account_id`),
  KEY `account` (`account`),
  KEY `account_valid` (`account`,`invalid`),
  KEY `last_used` (`last_used`),
  CONSTRAINT `FK_user_account_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='socialni site uzivatele';


DROP TABLE IF EXISTS `user_facebook_page`;
CREATE TABLE `user_facebook_page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `page_id` bigint(20) unsigned NOT NULL,
  `created` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `last_update` datetime NOT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `account_id` bigint(20) DEFAULT NULL,
  `country` char(2) DEFAULT NULL,
  `invalid` tinyint(1) DEFAULT NULL,
  `last_used` datetime DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_page_id_account_id` (`user_id`,`page_id`,`account_id`),
  KEY `user_id` (`user_id`),
  KEY `page_id` (`page_id`),
  KEY `account_id` (`account_id`),
  KEY `invalid` (`invalid`),
  KEY `last_used` (`last_used`),
  CONSTRAINT `FK_user_facebook_page_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='FB pages uzivatele';


DROP TABLE IF EXISTS `user_google_page`;
CREATE TABLE `user_google_page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `page_id` char(30) NOT NULL,
  `created` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `last_update` datetime NOT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `account_id` char(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `page_id` (`page_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `FK_user_google_page_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='G+ pages uzivatele';


DROP TABLE IF EXISTS `user_linkedin_page`;
CREATE TABLE `user_linkedin_page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `page_id` char(40) NOT NULL,
  `created` datetime NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `account_id` char(40) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_key` (`user_id`,`page_id`),
  KEY `user_id` (`user_id`),
  KEY `account_id` (`account_id`),
  KEY `page_id` (`page_id`),
  CONSTRAINT `FK_user_linkedin_page_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_linkedin_page_user_account` FOREIGN KEY (`account_id`) REFERENCES `user_account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni LI page v tymu';


DROP TABLE IF EXISTS `user_youtube_channel`;
CREATE TABLE `user_youtube_channel` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `channel_id` char(40) DEFAULT NULL,
  `created` datetime NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `access_token` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_key` (`user_id`,`channel_id`),
  KEY `user_id` (`user_id`),
  KEY `page_id` (`channel_id`),
  CONSTRAINT `FK_user_youtube_channel_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='YT uzivatelu';


DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lang` char(2) NOT NULL DEFAULT 'en',
  `code` varchar(50) NOT NULL,
  `from_email` varchar(255) DEFAULT NULL,
  `from_name` varchar(255) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_lang` (`code`,`lang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `user_invite`;
CREATE TABLE `user_invite` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `hash` char(40) NOT NULL,
  `datetime` datetime NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `text` text,
  `subject` varchar(255) DEFAULT NULL,
  `status` enum('new','wait','accepted','error') NOT NULL DEFAULT 'new',
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash` (`hash`),
  KEY `FK_user_invite_user` (`user_id`),
  CONSTRAINT `FK_user_invite_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='pozvanka do tymu';


DROP TABLE IF EXISTS `ec_module`;
CREATE TABLE `ec_module` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` char(40) NOT NULL,
  `label` char(20) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `module` enum('socialinbox','email','rss','monitoring','publisher','report','chart','analytics','comparisons','customercare') DEFAULT NULL,
  `settings` text,
  `sort` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `workspace_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `user_id` (`user_id`),
  KEY `module` (`module`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `FK_ec_module_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ec_module_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='ZoomSphere moduly';


DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
  `user_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `text` text,
  `orig` text,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FK_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='user settings... stare a el doposud nekde vyuzivane..';



DROP TABLE IF EXISTS `email`;
CREATE TABLE `email` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '0',
  `user_id` int(11) unsigned DEFAULT NULL,
  `imap_username` char(50) DEFAULT NULL,
  `smtp_username` char(50) DEFAULT NULL,
  `imap_password` varchar(255) DEFAULT NULL,
  `smtp_password` varchar(255) DEFAULT NULL,
  `imap_server` varchar(100) DEFAULT NULL,
  `smtp_server` varchar(100) DEFAULT NULL,
  `imap_port` smallint(5) DEFAULT NULL,
  `smtp_port` smallint(5) DEFAULT NULL,
  `imap_secure` enum('ssl','tls','none') DEFAULT NULL,
  `smtp_secure` enum('ssl','tls','none') DEFAULT NULL,
  `settings` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `FK_email_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='uzivatelske emaily pro CC';



DROP TABLE IF EXISTS `business_hours`;
CREATE TABLE `business_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `active` tinyint(1) unsigned NOT NULL,
  `hours` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `FK_business_hours_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='nastaveni pracovni doby pro CC/SMF modul';


DROP TABLE IF EXISTS `user_label`;
CREATE TABLE `user_label` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8_czech_ci NOT NULL,
  `color` char(7) COLLATE utf8_czech_ci NOT NULL,
  `workspace_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_id`,`name`,`workspace_id`),
  KEY `user_id` (`user_id`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `FK_user_label_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_label_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci COMMENT='incoming labels - puvodni, proto nema prefix';


DROP TABLE IF EXISTS `user_label_outgoing`;
CREATE TABLE `user_label_outgoing` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8_czech_ci NOT NULL,
  `color` char(7) COLLATE utf8_czech_ci NOT NULL,
  `workspace_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_id`,`name`,`workspace_id`),
  KEY `user_id` (`user_id`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `FK_user_label_outgoing_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_label_outgoing_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci COMMENT='outgoing labels';


DROP TABLE IF EXISTS `share_workspace`;
CREATE TABLE `share_workspace` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL DEFAULT '0',
  `to_user_id` int(11) unsigned NOT NULL DEFAULT '0',
  `workspace_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`from_user_id`,`to_user_id`,`workspace_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `workspace_id` (`workspace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni WS v tymu';


DROP TABLE IF EXISTS `workspace`;
CREATE TABLE `workspace` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` char(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `FK_workspace_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='WS';


DROP TABLE IF EXISTS `user_api_profile`;
CREATE TABLE `user_api_profile` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `api_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `api_id` (`api_id`),
  CONSTRAINT `FK_user_api_profile_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='API prodily';


DROP TABLE IF EXISTS `user_admin_ids`;
CREATE TABLE `user_admin_ids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `name` varchar(50) COLLATE utf8_czech_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`from_user_id`,`to_user_id`),
  KEY `FK_user_admin_ids_user_2` (`to_user_id`),
  CONSTRAINT `FK_user_admin_ids_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_admin_ids_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci COMMENT='pro potreby switche na uzivatele vybranych adminu';

DROP TABLE IF EXISTS `share_ec_module`;
CREATE TABLE `share_ec_module` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL DEFAULT '0',
  `to_user_id` int(11) unsigned NOT NULL DEFAULT '0',
  `ec_module_id` int(11) unsigned NOT NULL DEFAULT '0',
  `sort` tinyint(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`from_user_id`,`to_user_id`,`ec_module_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `FK_share_ec_module_ec_module` (`ec_module_id`),
  CONSTRAINT `FK_share_ec_module_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_ec_module_ec_module` FOREIGN KEY (`ec_module_id`) REFERENCES `ec_module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_ec_module_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni modulu v tymu';

DROP TABLE IF EXISTS `user_read_status`;
CREATE TABLE `user_read_status` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8_czech_ci NOT NULL,
  `color` char(7) COLLATE utf8_czech_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8_czech_ci NOT NULL,
  `sort` tinyint(2) NOT NULL,
  `default` enum('1') COLLATE utf8_czech_ci DEFAULT NULL,
  `workspace_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_id`,`name`,`workspace_id`),
  KEY `user_id` (`user_id`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `FK_user_read_status_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_read_status_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci COMMENT='read status fo SocialInbox';


DROP TABLE IF EXISTS `instagramAdmins`;
CREATE TABLE `instagramAdmins` (
  `user_id` int(11) unsigned NOT NULL,
  `account_id` char(40) NOT NULL,
  `grant` text,
  PRIMARY KEY (`user_id`,`account_id`),
  CONSTRAINT `FK_instagramAdmins_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='share instagram profiles';

DROP TABLE IF EXISTS `share_api_profile`;
CREATE TABLE `share_api_profile` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `user_api_profile_id` int(11) unsigned NOT NULL,
  `grant` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`from_user_id`,`to_user_id`,`user_api_profile_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `FK_share_api_profile_user_api_profile` (`user_api_profile_id`),
  CONSTRAINT `FK_share_api_profile_user_api_profile` FOREIGN KEY (`user_api_profile_id`) REFERENCES `user_api_profile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_api_profile_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_api_profile_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni API v tymu';

DROP TABLE IF EXISTS `share_email`;
CREATE TABLE `share_email` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL DEFAULT '0',
  `to_user_id` int(11) unsigned NOT NULL DEFAULT '0',
  `email_id` int(11) unsigned NOT NULL DEFAULT '0',
  `grant` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`from_user_id`,`to_user_id`,`email_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `email_id` (`email_id`,`to_user_id`),
  CONSTRAINT `FK_share_email_email` FOREIGN KEY (`email_id`) REFERENCES `email` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_email_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_email_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni emailu v tymu - zatim nevuzivame, ale budeme';

DROP TABLE IF EXISTS `share_facebook_page`;
CREATE TABLE `share_facebook_page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `user_facebook_page_id` int(11) unsigned NOT NULL,
  `grant` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`from_user_id`,`to_user_id`,`user_facebook_page_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `FK_share_facebook_page_user_facebook_page` (`user_facebook_page_id`),
  CONSTRAINT `FK_share_facebook_page_user_facebook_page` FOREIGN KEY (`user_facebook_page_id`) REFERENCES `user_facebook_page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_facebook_page_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_facebook_page_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni FB page v tymu';

DROP TABLE IF EXISTS `share_google_page`;
CREATE TABLE `share_google_page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `user_google_page_id` int(11) unsigned NOT NULL,
  `grant` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`from_user_id`,`to_user_id`,`user_google_page_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `FK_share_google_page_user_google_page` (`user_google_page_id`),
  CONSTRAINT `FK_share_google_page_user_google_page` FOREIGN KEY (`user_google_page_id`) REFERENCES `user_google_page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_google_page_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_google_page_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni G+ page v tymu';

DROP TABLE IF EXISTS `share_linkedin_page`;
CREATE TABLE `share_linkedin_page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `user_linkedin_page_id` int(11) unsigned NOT NULL,
  `grant` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`from_user_id`,`to_user_id`,`user_linkedin_page_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `FK_share_linkedin_page_user_linkedin_page` (`user_linkedin_page_id`),
  CONSTRAINT `FK_share_linkedin_page_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_linkedin_page_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_linkedin_page_user_linkedin_page` FOREIGN KEY (`user_linkedin_page_id`) REFERENCES `user_linkedin_page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni LI page';

DROP TABLE IF EXISTS `share_youtube_channel`;
CREATE TABLE `share_youtube_channel` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) unsigned NOT NULL,
  `to_user_id` int(11) unsigned NOT NULL,
  `user_youtube_channel_id` int(11) unsigned NOT NULL,
  `grant` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`from_user_id`,`to_user_id`,`user_youtube_channel_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `FK_share_youtube_channel_user_youtube_channel` (`user_youtube_channel_id`),
  CONSTRAINT `FK_share_youtube_channel_user_youtube_channel` FOREIGN KEY (`user_youtube_channel_id`) REFERENCES `user_youtube_channel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_youtube_channel_user` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_share_youtube_channel_user_2` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='sdileni YT v tymu';

DROP TABLE IF EXISTS `twitterAdmins`;
CREATE TABLE `twitterAdmins` (
  `user_id` int(11) unsigned NOT NULL,
  `account_id` char(40) NOT NULL,
  `grant` text,
  PRIMARY KEY (`user_id`,`account_id`),
  CONSTRAINT `FK_twitterAdmins_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='share TW profilu';

DROP TABLE IF EXISTS `postbox_status`;
CREATE TABLE `postbox_status` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` char(17) NOT NULL,
  `access_read` varchar(255) NOT NULL,
  `access_write` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `publish` tinyint(4) NOT NULL,
  `bgcolor` char(17) NOT NULL,
  `sent` tinyint(1) NOT NULL DEFAULT '0',
  `email` varchar(500) NOT NULL DEFAULT '',
  `sort` tinyint(3) NOT NULL DEFAULT '0',
  `workspace_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `date_publish` (`date`),
  KEY `user_id` (`user_id`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `FK_postbox_status_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_postbox_status_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `crm_tag`;
CREATE TABLE `crm_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` char(50) COLLATE utf8_czech_ci NOT NULL,
  `master_account_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_id`,`name`,`master_account_id`),
  KEY `user_id` (`user_id`),
  KEY `master_account_id` (`master_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci COMMENT='CRM tagy';

DROP TABLE IF EXISTS `user_tag`;
CREATE TABLE `user_tag` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8_czech_ci NOT NULL,
  `workspace_id` int(11) unsigned DEFAULT NULL,
  `master_account_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_id`,`name`,`workspace_id`,`master_account_id`),
  KEY `user_id` (`user_id`),
  KEY `workspace_id` (`workspace_id`),
  KEY `master_account_id` (`master_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci COMMENT='uzivatelske tagy pro WS';