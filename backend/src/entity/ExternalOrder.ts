import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './OrderItem';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity()
export class ExternalOrder {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.externalOrder)
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column()
  adminUserId: string;

  @Column({ nullable: true })
  customerNote: string;

  @CreateDateColumn()
  createdAt: Date;
} 