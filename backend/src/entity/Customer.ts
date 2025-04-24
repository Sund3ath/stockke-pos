import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'last_visit', type: 'date', nullable: true })
  lastVisit: Date;

  // Beziehung zu Bestellungen kann später hinzugefügt werden, wenn benötigt
  // @OneToMany(() => Order, order => order.customer)
  // orders: Order[];
}