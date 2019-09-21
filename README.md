#PROBLEM STATEMENT ----> online_judge

###TEAM DETAILS:---

#TEAM NAME ----> CodeBreakers

#MEMBER1 --> HARSHIT GARG 
REG no. -> 20184035

#MEMBER2 --> SHIVAM GUPTA
REG no. -> 20184094

#MEMBER3 --> SUJEET KUSHWAHA
REG no. -> 20184098


#CREATE YOUR NewsAPI.org API KEY and paste it in public/js/jnews.js file at the mentioned position

#CREATE YOUR GITHUB CLIENT_ID and CLIENT_SECRET and paste it in public/js/jnews.js file at the mentioned position

##http://localhost:3000/auth/github/redirect"  <--- ONLY MENTION THIS REDIRECT URL WHILE CREATING THE CLIENT_ID


#RUN THE FOLLOWING BELOW COMMAND IN THE TERMINAL IN YOUR PROJECT DIRECTORY

npm init
npm install body-parser compile-run connect-flash cookie-parser ejs express express-fileupload express-session fs-extra memorystore mysql node-cron nodemailer path unzip




DATABASE SCHEMA

TABLES:-

admin | CREATE TABLE `admin` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `password` varchar(40) NOT NULL,
  `email` varchar(50) NOT NULL,
  `username` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1

 chat  | CREATE TABLE `chat` (
  `sender_id` int(6) NOT NULL,
  `receiver_id` int(6) NOT NULL,
  `message` tinytext NOT NULL,
  `date_time` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1 


 contest_details | CREATE TABLE `contest_details` (
  `contest_id` int(6) NOT NULL AUTO_INCREMENT,
  `user_id` int(6) NOT NULL,
  `contest_name` varchar(30) NOT NULL,
  `start_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_date` date NOT NULL,
  `end_time` time NOT NULL,
  `org_type` set('school','company','non-profit','other') NOT NULL,
  `org_name` tinytext NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`contest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 |

 contest_logins | CREATE TABLE `contest_logins` (
  `contest_id` int(6) NOT NULL,
  `user_id` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 

contest_new_problems | CREATE TABLE `contest_new_problems` (
  `problem_id` int(6) NOT NULL AUTO_INCREMENT,
  `contest_id` int(6) NOT NULL,
  `problem_name` varchar(30) NOT NULL,
  `difficulty` set('easy','medium','hard') DEFAULT NULL,
  `subdomain` set('strings','sorting','search','arrays','graph','greedy','dp','bitman','game','recursion','algorithm','np') NOT NULL,
  `time_limit` float NOT NULL,
  `memory_limit` int(3) NOT NULL,
  `problem_statement` text NOT NULL,
  `input` text NOT NULL,
  `constraints` text NOT NULL,
  `output` text NOT NULL,
  `sample_in` text NOT NULL,
  `sample_out` text NOT NULL,
  `explanation` text NOT NULL,
  `date` date NOT NULL,
  `status` set('1','0') NOT NULL,
  PRIMARY KEY (`problem_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1

contest_old_problems | CREATE TABLE `contest_old_problems` (
  `contest_id` int(6) NOT NULL,
  `problem_id` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 


contest_signups | CREATE TABLE `contest_signups` (
  `contest_id` int(6) NOT NULL,
  `user_id` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1


contest_submission | CREATE TABLE `contest_submission` (
  `problem_id` int(6) NOT NULL,
  `contest_id` int(6) NOT NULL,
  `user_id` int(6) NOT NULL,
  `datetime` datetime NOT NULL,
  `status` set('AC','WA','TLE','RE','CE') DEFAULT NULL,
  `solution` text NOT NULL,
  `time` float NOT NULL,
  `memory` float NOT NULL,
  `language` set('c','cpp','csharp','golang','java','javscript','python2','python3','ruby','rust') DEFAULT NULL,
  `id` int(6) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1


editor_submission | CREATE TABLE `editor_submission` (
  `user_id` int(6) NOT NULL,
  `solution` text,
  `language` set('c','cpp','csharp','golang','java','javascript','python2','python3','ruby','rust') NOT NULL,
  `problem_id` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 


followers | CREATE TABLE `followers` (
  `follower_id` int(6) NOT NULL,
  `following_id` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1


friend | CREATE TABLE `friend` (
  `friend1` int(6) NOT NULL,
  `friend2` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 


 otp_table | CREATE TABLE `otp_table` (
  `username` varchar(30) NOT NULL,
  `otp` int(4) NOT NULL,
  `datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1


pending_friend | CREATE TABLE `pending_friend` (
  `friend1` int(6) NOT NULL,
  `friend2` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1


 problems | CREATE TABLE `problems` (
  `problem_id` int(6) NOT NULL AUTO_INCREMENT,
  `user_id` int(6) NOT NULL,
  `problem_name` varchar(30) NOT NULL,
  `difficulty` set('easy','medium','hard') DEFAULT NULL,
  `subdomain` set('strings','sorting','search','arrays','graph','greedy','dp','bitman','game','recursion','algorithm','np') NOT NULL,
  `time_limit` float NOT NULL,
  `memory_limit` int(3) NOT NULL,
  `problem_statement` text NOT NULL,
  `input` text NOT NULL,
  `constraints` text NOT NULL,
  `output` text NOT NULL,
  `sample_in` text NOT NULL,
  `sample_out` text NOT NULL,
  `explanation` text NOT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1


submission | CREATE TABLE `submission` (
  `problem_id` int(6) NOT NULL,
  `user_id` int(6) NOT NULL,
  `date_time` datetime DEFAULT NULL,
  `solution` text NOT NULL,
  `time` float NOT NULL,
  `memory` float NOT NULL,
  `language` set('c','cpp','csharp','golang','java','javascript','python2','python3','ruby','rust') NOT NULL,
  `status` set('AC','WA','TLE','RE','CE') DEFAULT NULL,
  `id` int(6) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 


user  | CREATE TABLE `user` (
  `id` int(6) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(40) NOT NULL,
  `gender` set('male','female','other') DEFAULT NULL,
  `city` varchar(20) NOT NULL,
  `state` varchar(20) NOT NULL,
  `college` varchar(100) NOT NULL,
  `points` int(6) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 


verified_contest_details | CREATE TABLE `verified_contest_details` (
  `contest_id` int(6) NOT NULL AUTO_INCREMENT,
  `user_id` int(6) NOT NULL,
  `contest_name` varchar(30) NOT NULL,
  `start_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_date` date NOT NULL,
  `end_time` time NOT NULL,
  `org_type` set('school','company','non-profit','other') NOT NULL,
  `org_name` tinytext NOT NULL,
  `date` date NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(40) NOT NULL,
  `description` text NOT NULL,
  `prizes` text NOT NULL,
  `rules` text NOT NULL,
  `scoring` text NOT NULL,
  PRIMARY KEY (`contest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 


verified_problems | CREATE TABLE `verified_problems` (
  `problem_id` int(6) NOT NULL AUTO_INCREMENT,
  `user_id` int(6) NOT NULL,
  `problem_name` varchar(30) NOT NULL,
  `difficulty` set('easy','medium','hard') DEFAULT NULL,
  `subdomain` set('strings','sorting','search','arrays','graph','greedy','dp','bitman','game','recursion','algorithm','np') NOT NULL,
  `time_limit` float NOT NULL,
  `memory_limit` int(3) NOT NULL,
  `problem_statement` text NOT NULL,
  `input` text NOT NULL,
  `constraints` text NOT NULL,
  `output` text NOT NULL,
  `sample_in` text NOT NULL,
  `sample_out` text NOT NULL,
  `explanation` text NOT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`problem_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1
