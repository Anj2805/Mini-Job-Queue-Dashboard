import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: string;

  @Index() // Bonus feature: database index on status
  @Column({ type: 'varchar', default: 'pending' })
  status: JobStatus;

  @CreateDateColumn()
  createdAt: Date;
}
