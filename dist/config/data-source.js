"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
const Course_1 = require("../entities/Course");
const Lecture_1 = require("../entities/Lecture");
const Notification_1 = require("../entities/Notification");
const Purchase_1 = require("../entities/Purchase");
const TeacherPayout_1 = require("../entities/TeacherPayout");
const Specialization_1 = require("../entities/Specialization");
const TopupRequest_1 = require("../entities/TopupRequest");
const Transaction_1 = require("../entities/Transaction");
const User_1 = require("../entities/User");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    username: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    database: env_1.env.DB_NAME,
    entities: [User_1.User, Specialization_1.Specialization, Course_1.Course, Lecture_1.Lecture, Purchase_1.Purchase, TeacherPayout_1.TeacherPayout, Transaction_1.Transaction, TopupRequest_1.TopupRequest, Notification_1.Notification],
    synchronize: env_1.env.DB_SYNC,
    logging: false,
    charset: 'utf8mb4_unicode_ci',
});
