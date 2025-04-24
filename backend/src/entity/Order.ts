import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './OrderItem';
import { User } from './User';
import { Table } from './Table';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'pending' })
  status: string;

  @Column()
  timestamp: string;

  @Column()
  paymentMethod: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cashReceived: number;

  @Column({ nullable: true })
  tableId: string;

  @ManyToOne(() => Table, table => table.orders, { nullable: true })
  table: Table;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}