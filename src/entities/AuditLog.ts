import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumns } from './BaseColumns';
import { User } from './User';

@Entity({ name: 'audit_logs' })
export class AuditLog extends BaseColumns {
  @Column({ name: 'actor_id', type: 'int', nullable: true })
  actorId!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor!: User | null;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100, nullable: true })
  entityType!: string | null;

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId!: number | null;

  @Column({ type: 'longtext', nullable: true })
  metadata!: string | null;
}