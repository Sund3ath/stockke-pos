import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('category_sales')
export class CategorySales extends BaseEntity {
  @Column({ name: 'sale_date', type: 'date' })
  saleDate: Date;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  quantity: number;

  // Zusammengesetzter Unique-Index für Datum und Kategorie
  // Wird in der Migration definiert
}