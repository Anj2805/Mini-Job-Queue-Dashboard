import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module.js';
import { Job } from './jobs/job.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Job],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    JobsModule,
  ],
})
export class AppModule {}
