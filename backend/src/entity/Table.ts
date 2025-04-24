import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order';

@Entity('tables')
export class Table extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: false })
  occupied: boolean;

  @OneToMany(() => Order, order => order.table)
  orders: Order[];
}