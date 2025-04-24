import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';

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
  entities: [path.join(__dirname, '../entity/**/*.{js,ts}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{js,ts}')],
  subscribers: [path.join(__dirname, '../subscriber/**/*.{js,ts}')],
  charset: 'utf8mb4_unicode_ci',
});