import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './Order';
import { ExternalOrder } from './ExternalOrder';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 5, scale: 2 })
  taxRate: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE', nullable: true })
  order: Order;

  @ManyToOne(() => ExternalOrder, externalOrder => externalOrder.items, { onDelete: 'CASCADE', nullable: true })
  externalOrder: ExternalOrder;

  @Column({ nullable: true })
  externalOrderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}