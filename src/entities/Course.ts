import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { Lecture } from './Lecture';
import { Purchase } from './Purchase';
import { Specialization } from './Specialization';
import { User } from './User';

@Entity({ name: 'courses' })
@Index('idx_course_specialization_year', ['specialization', 'year'])
export class Course extends BaseColumns {
  @ManyToOne(() => Specialization, (specialization) => specialization.courses, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'specialization_id' })
  specialization!: Specialization;

  @ManyToOne(() => User, (user) => user.taughtCourses, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: User | null;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'teacher_percent', type: 'decimal', precision: 5, scale: 2, default: '0.00' })
  teacherPercent!: string;

  @OneToMany(() => Lecture, (lecture) => lecture.course)
  lectures!: Lecture[];

  @OneToMany(() => Purchase, (purchase) => purchase.course)
  purchases!: Purchase[];
}
