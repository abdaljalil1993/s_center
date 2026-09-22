import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { User } from './User';

@Entity({ name: 'idempotency_keys' })
@Index(['actorId', 'key', 'route'], { unique: true })
export class IdempotencyKey extends BaseColumns {
  @Column({ name: 'actor_id', type: 'int' })
  actorId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor!: User;

  @Column({ type: 'varchar', length: 64 })
  key!: string;

  @Column({ type: 'varchar', length: 255 })
  route!: string;

  @Column({ name: 'response_status', type: 'int', nullable: true })
  responseStatus!: number | null;

  @Column({ name: 'response_body', type: 'longtext', nullable: true })
  responseBody!: string | null;

  @Column({ name: 'is_processing', type: 'boolean', default: true })
  isProcessing!: boolean;
}