import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order';

@Entity('tse_transactions')
export class TSETransaction extends BaseEntity {
  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'transaction_time', type: 'timestamp' })
  transactionTime: Date;

  @Column()
  signature: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}