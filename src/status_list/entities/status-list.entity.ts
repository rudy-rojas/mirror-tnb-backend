import { RequestEntity } from '@/app-mobile/service-requests/entities/service-request.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('status_list')
export class StatusListEntity {
  @PrimaryGeneratedColumn({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'name', type: 'text', nullable: true })
  name: string;

  @Column({ name: 'order', nullable: true })
  order: number;

  @Column({ name: 'status', nullable: true })
  status: number;

  @Column({ name: 'color', type: 'text', nullable: true })
  color: string;

  @OneToMany(() => RequestEntity, (request) => request.fkRequestStatus)
  serviceRequests: RequestEntity[];
}