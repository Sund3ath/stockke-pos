import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  category: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: true })
  inStock: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 19.0 })
  taxRate: number;

  @ManyToOne(() => User, { nullable: false })
  adminUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}