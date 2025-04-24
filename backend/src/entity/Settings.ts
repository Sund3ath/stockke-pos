import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.settings)
  user: User;

  @Column({ default: 'en' })
  language: string;

  @Column('simple-json')
  currency: {
    code: string;
    symbol: string;
    position: string;
  };

  @Column({ default: 'Europe/Berlin' })
  timezone: string;

  @Column('simple-json')
  tse: {
    apiKey: string;
    deviceId: string;
    environment: string;
  };

  @Column('simple-json')
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };

  @Column('simple-json')
  receipt: {
    header: string;
    footer: string;
    showLogo: boolean;
  };

  @Column('simple-json')
  tax: {
    enabled: boolean;
    rate: number;
  };

  @Column('simple-json')
  printer: {
    enabled: boolean;
    name: string;
  };

  @Column('simple-json')
  modules: {
    tse: boolean;
    customers: boolean;
  };

  @Column('simple-json', { nullable: true })
  lieferando?: {
    apiKey: string;
    restaurantId: string;
    apiUrl: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}