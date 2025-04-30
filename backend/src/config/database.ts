import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';
import { ExternalOrder } from '../entity/ExternalOrder';

// Lade Umgebungsvariablen aus .env-Datei
dotenv.config();

// Konfiguration für die Datenbankverbindung
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'Kuntay1992.',
  database: process.env.DB_DATABASE || 'stockke_pos',
  synchronize: true, // Temporär aktivieren, um die Änderungen zu synchronisieren
  logging: process.env.NODE_ENV !== 'production',
  entities: [path.join(process.cwd(), 'src/entity/**/*.{js,ts}'), ExternalOrder],
  migrations: [path.join(process.cwd(), 'src/migrations/**/*.{js,ts}')],
  subscribers: [path.join(process.cwd(), 'src/subscriber/**/*.{js,ts}')],
  charset: 'utf8mb4_unicode_ci',
});