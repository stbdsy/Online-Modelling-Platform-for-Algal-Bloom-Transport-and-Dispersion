/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80023
 Source Host           : localhost:3306
 Source Schema         : inbloom

 Target Server Type    : MySQL
 Target Server Version : 80023
 File Encoding         : 65001

 Date: 01/12/2021 21:26:59
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for greentide_biomass
-- ----------------------------
DROP TABLE IF EXISTS `greentide_biomass`;
CREATE TABLE `greentide_biomass`  (
  `year` int(0) NULL DEFAULT NULL,
  `month` int(0) NULL DEFAULT NULL,
  `val` float(255, 0) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of greentide_biomass
-- ----------------------------
INSERT INTO `greentide_biomass` VALUES (2018, 4, 47);
INSERT INTO `greentide_biomass` VALUES (2018, 5, 123);
INSERT INTO `greentide_biomass` VALUES (2018, 6, 987);
INSERT INTO `greentide_biomass` VALUES (2018, 7, 7789);
INSERT INTO `greentide_biomass` VALUES (2018, 8, 987);
INSERT INTO `greentide_biomass` VALUES (2018, 9, 189);
INSERT INTO `greentide_biomass` VALUES (2019, 4, 39);
INSERT INTO `greentide_biomass` VALUES (2019, 5, 118);
INSERT INTO `greentide_biomass` VALUES (2019, 6, 471);
INSERT INTO `greentide_biomass` VALUES (2019, 7, 5874);
INSERT INTO `greentide_biomass` VALUES (2019, 8, 2890);
INSERT INTO `greentide_biomass` VALUES (2019, 9, 546);
INSERT INTO `greentide_biomass` VALUES (2020, 4, 156);
INSERT INTO `greentide_biomass` VALUES (2020, 5, 243);
INSERT INTO `greentide_biomass` VALUES (2020, 6, 799);
INSERT INTO `greentide_biomass` VALUES (2020, 7, 151);
INSERT INTO `greentide_biomass` VALUES (2020, 8, 549);
INSERT INTO `greentide_biomass` VALUES (2020, 9, 232);

-- ----------------------------
-- Table structure for greentide_growthrate
-- ----------------------------
DROP TABLE IF EXISTS `greentide_growthrate`;
CREATE TABLE `greentide_growthrate`  (
  `year` int(0) NULL DEFAULT NULL,
  `month` int(0) NULL DEFAULT NULL,
  `val` float(255, 0) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of greentide_growthrate
-- ----------------------------
INSERT INTO `greentide_growthrate` VALUES (2018, 4, NULL);
INSERT INTO `greentide_growthrate` VALUES (2018, 5, 159);
INSERT INTO `greentide_growthrate` VALUES (2018, 6, 705);
INSERT INTO `greentide_growthrate` VALUES (2018, 7, 689);
INSERT INTO `greentide_growthrate` VALUES (2018, 8, -87);
INSERT INTO `greentide_growthrate` VALUES (2018, 9, -81);
INSERT INTO `greentide_growthrate` VALUES (2019, 4, NULL);
INSERT INTO `greentide_growthrate` VALUES (2019, 5, 207);
INSERT INTO `greentide_growthrate` VALUES (2019, 6, 297);
INSERT INTO `greentide_growthrate` VALUES (2019, 7, 1148);
INSERT INTO `greentide_growthrate` VALUES (2019, 8, -51);
INSERT INTO `greentide_growthrate` VALUES (2019, 9, -81);
INSERT INTO `greentide_growthrate` VALUES (2020, 4, NULL);
INSERT INTO `greentide_growthrate` VALUES (2020, 5, 56);
INSERT INTO `greentide_growthrate` VALUES (2020, 6, 228);
INSERT INTO `greentide_growthrate` VALUES (2020, 7, -81);
INSERT INTO `greentide_growthrate` VALUES (2020, 8, 262);
INSERT INTO `greentide_growthrate` VALUES (2020, 9, -58);

-- ----------------------------
-- Table structure for seaweedfield_biomass
-- ----------------------------
DROP TABLE IF EXISTS `seaweedfield_biomass`;
CREATE TABLE `seaweedfield_biomass`  (
  `year` int(0) NULL DEFAULT NULL,
  `month` int(0) NULL DEFAULT NULL,
  `val` float(255, 0) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of seaweedfield_biomass
-- ----------------------------
INSERT INTO `seaweedfield_biomass` VALUES (2018, 4, 227);
INSERT INTO `seaweedfield_biomass` VALUES (2018, 5, 371);
INSERT INTO `seaweedfield_biomass` VALUES (2018, 6, 853);
INSERT INTO `seaweedfield_biomass` VALUES (2018, 7, 1987);
INSERT INTO `seaweedfield_biomass` VALUES (2018, 8, 742);
INSERT INTO `seaweedfield_biomass` VALUES (2018, 9, 525);
INSERT INTO `seaweedfield_biomass` VALUES (2019, 4, 197);
INSERT INTO `seaweedfield_biomass` VALUES (2019, 5, 295);
INSERT INTO `seaweedfield_biomass` VALUES (2019, 6, 463);
INSERT INTO `seaweedfield_biomass` VALUES (2019, 7, 1580);
INSERT INTO `seaweedfield_biomass` VALUES (2019, 8, 328);
INSERT INTO `seaweedfield_biomass` VALUES (2019, 9, 333);
INSERT INTO `seaweedfield_biomass` VALUES (2020, 4, 58);
INSERT INTO `seaweedfield_biomass` VALUES (2020, 5, 145);
INSERT INTO `seaweedfield_biomass` VALUES (2020, 6, 420);
INSERT INTO `seaweedfield_biomass` VALUES (2020, 7, 257);
INSERT INTO `seaweedfield_biomass` VALUES (2020, 8, 207);
INSERT INTO `seaweedfield_biomass` VALUES (2020, 9, 114);

-- ----------------------------
-- Table structure for seaweedfield_growthrate
-- ----------------------------
DROP TABLE IF EXISTS `seaweedfield_growthrate`;
CREATE TABLE `seaweedfield_growthrate`  (
  `year` int(0) NULL DEFAULT NULL,
  `month` int(0) NULL DEFAULT NULL,
  `val` float(255, 0) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of seaweedfield_growthrate
-- ----------------------------
INSERT INTO `seaweedfield_growthrate` VALUES (2018, 4, NULL);
INSERT INTO `seaweedfield_growthrate` VALUES (2018, 5, 63);
INSERT INTO `seaweedfield_growthrate` VALUES (2018, 6, 130);
INSERT INTO `seaweedfield_growthrate` VALUES (2018, 8, -63);
INSERT INTO `seaweedfield_growthrate` VALUES (2018, 7, 133);
INSERT INTO `seaweedfield_growthrate` VALUES (2018, 9, -29);
INSERT INTO `seaweedfield_growthrate` VALUES (2019, 4, NULL);
INSERT INTO `seaweedfield_growthrate` VALUES (2019, 5, 49);
INSERT INTO `seaweedfield_growthrate` VALUES (2019, 6, 57);
INSERT INTO `seaweedfield_growthrate` VALUES (2019, 7, 241);
INSERT INTO `seaweedfield_growthrate` VALUES (2019, 8, -79);
INSERT INTO `seaweedfield_growthrate` VALUES (2019, 9, -2);
INSERT INTO `seaweedfield_growthrate` VALUES (2020, 4, NULL);
INSERT INTO `seaweedfield_growthrate` VALUES (2020, 5, 150);
INSERT INTO `seaweedfield_growthrate` VALUES (2020, 6, 190);
INSERT INTO `seaweedfield_growthrate` VALUES (2020, 7, -39);
INSERT INTO `seaweedfield_growthrate` VALUES (2020, 8, -20);
INSERT INTO `seaweedfield_growthrate` VALUES (2020, 9, -45);

-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks`  (
  `taskid` int(0) NOT NULL AUTO_INCREMENT,
  `taskname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `model` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `starttime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `endtime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `timeStep` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `pointsnum` int(0) NULL DEFAULT NULL,
  `biomass` float(255, 0) NULL DEFAULT NULL,
  `strand` float NULL DEFAULT NULL,
  `windDragCoef` float NULL DEFAULT NULL,
  `windSpeed` float NULL DEFAULT NULL,
  `windDirection` float NULL DEFAULT NULL,
  `initialArea` varchar(10000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `FbmStepSize` int(0) NULL DEFAULT NULL,
  `hurst` float NULL DEFAULT NULL,
  PRIMARY KEY (`taskid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 380 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tasks
-- ----------------------------
INSERT INTO `tasks` VALUES (235, 'RedTideDemo', 'admin', '1637136926', 'fBm', '1372723200', '1372838400', '3600', 5000, 0, 0.1, 0.01, 1, 180, '{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"properties\":{\"edittype\":\"polygon_clampToGround\",\"name\":\"贴地面\",\"config\":{\"height\":false},\"style\":{},\"attr\":{\"id\":\"20211117161419\"},\"type\":\"polygon\"},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[119.509985,39.818759,0],[119.526581,39.80965,0],[119.550212,39.816709,0],[119.541763,39.804909,0],[119.540442,39.788951,0],[119.531785,39.780681,0],[119.523064,39.754731,0],[119.521642,39.740541,0],[119.515547,39.727954,0],[119.517227,39.719183,0],[119.51206,39.710163,0],[119.507001,39.699378,0],[119.508189,39.679987,0],[119.498354,39.67256,0],[119.500035,39.663787,0],[119.483412,39.636671,0],[119.423916,39.527519,0],[119.42729,39.509965,0],[119.408939,39.474791,0],[119.412258,39.458114,0],[119.405595,39.455209,0],[119.404747,39.432182,0],[119.357442,39.353496,0],[119.351176,39.325863,0],[119.316831,39.274171,0],[119.260297,39.250786,0],[119.169267,39.229444,0],[119.031953,39.293842,0],[119.366139,39.771689,0],[119.454434,39.827788,0],[119.495663,39.829268,0],[119.509985,39.818759,0],[119.509985,39.818759,0]]]}}]}', 120000, 0.7);
INSERT INTO `tasks` VALUES (379, 'GreenTideDemo', 'admin', '1638347974', 'fBm', '1630803600', '1631408400', '3600', 300, 0, 1, NULL, NULL, NULL, '{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"properties\":{\"edittype\":\"polygon_clampToGround\",\"name\":\"贴地面\",\"config\":{\"height\":false},\"style\":{},\"attr\":{\"id\":\"20211130111242\"},\"type\":\"polygon\"},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[119.55207,39.90023,0],[119.55495,39.898295,0],[119.548656,39.89443,0],[119.545748,39.89664,0],[119.55207,39.90023,0],[119.55207,39.90023,0]]]}}]}', 120000, 0.75);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `userid` int(0) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `clearance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`userid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('test', 1, 'test', '0');
INSERT INTO `users` VALUES ('admin', 2, 'admin', '0');

SET FOREIGN_KEY_CHECKS = 1;
