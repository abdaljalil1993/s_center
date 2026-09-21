import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { User } from './User';

@Entity({ name: 'notifications' })
export class Notification extends BaseColumns {
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;
}
