import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { env } from './env';
import { Course } from '../entities/Course';
import { Lecture } from '../entities/Lecture';
import { Notification } from '../entities/Notification';
import { Purchase } from '../entities/Purchase';
import { TeacherPayout } from '../entities/TeacherPayout';
import { Specialization } from '../entities/Specialization';
import { TopupRequest } from '../entities/TopupRequest';
import { Transaction } from '../entities/Transaction';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [User, Specialization, Course, Lecture, Purchase, TeacherPayout, Transaction, TopupRequest, Notification],
  synchronize: env.DB_SYNC,
  logging: false,
  charset: 'utf8mb4_unicode_ci',
});
