import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity.js';
import { CreateJobDto, UpdateJobStatusDto } from './dto.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create(createJobDto);
    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, updateDto: UpdateJobStatusDto): Promise<Job> {
    const { status: newStatus } = updateDto;
    
    // Determine expected current status based on allowed transitions
    let expectedCurrentStatus: JobStatus;
    if (newStatus === 'running') {
      expectedCurrentStatus = 'pending';
    } else if (newStatus === 'completed' || newStatus === 'failed') {
      expectedCurrentStatus = 'running';
    } else {
      throw new BadRequestException(`Invalid transition to status: ${newStatus}`);
    }

    // Attempt atomic update
    const result = await this.jobsRepository.update(
      { id, status: expectedCurrentStatus },
      { status: newStatus }
    );

    if (result.affected === 0) {
      // Find out why it failed
      const job = await this.jobsRepository.findOne({ where: { id } });
      if (!job) {
        throw new NotFoundException(`Job with ID ${id} not found`);
      }
      throw new ConflictException(
        `Cannot transition job from '${job.status}' to '${newStatus}'. Job state may have changed concurrently or transition is invalid.`
      );
    }

    return this.jobsRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }
}
