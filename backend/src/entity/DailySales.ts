import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('daily_sales')
export class DailySales extends BaseEntity {
  @Column({ name: 'sale_date', type: 'date', unique: true })
  saleDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'order_count' })
  orderCount: number;
}