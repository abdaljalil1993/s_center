import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { TopupMethod, TopupStatus } from './enums';
import { User } from './User';

@Entity({ name: 'topup_requests' })
@Unique('uq_topup_method_reference', ['method', 'referenceNumber'])
export class TopupRequest extends BaseColumns {
  @ManyToOne(() => User, (user) => user.topupRequests, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'enum', enum: TopupMethod })
  method!: TopupMethod;

  @Column({ name: 'reference_number', type: 'varchar', length: 100 })
  referenceNumber!: string;

  @Column({ name: 'sender_name', type: 'varchar', length: 150 })
  senderName!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'enum', enum: TopupStatus, default: TopupStatus.PENDING })
  status!: TopupStatus;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason!: string | null;

  @ManyToOne(() => User, (user) => user.reviewedTopupRequests, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy!: User | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt!: Date | null;
}
