import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { User } from './User';

@Entity({ name: 'teacher_payouts' })
export class TeacherPayout extends BaseColumns {
  @ManyToOne(() => User, (user) => user.teacherPayouts, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => User, (user) => user.createdTeacherPayouts, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;
}