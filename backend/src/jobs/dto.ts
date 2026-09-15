import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import type { JobStatus } from './job.entity.js';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdateJobStatusDto {
  @IsIn(['pending', 'running', 'completed', 'failed'])
  status: JobStatus;
}
