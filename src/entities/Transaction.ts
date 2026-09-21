import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { TransactionType } from './enums';
import { User } from './User';

@Entity({ name: 'transactions' })
export class Transaction extends BaseColumns {
  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2 })
  balanceAfter!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType!: string | null;

  @Column({ name: 'reference_id', type: 'int', nullable: true })
  referenceId!: number | null;
}
