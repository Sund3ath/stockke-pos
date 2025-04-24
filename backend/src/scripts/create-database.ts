import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Lade Umgebungsvariablen aus .env-Datei
dotenv.config();

/**
 * Skript zum Erstellen der Datenbank, falls sie noch nicht existiert
 */
async function createDatabase() {
  try {
    // Konfiguration für die Datenbankverbindung
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306');
    const user = process.env.DB_USERNAME || 'root';
    const password = process.env.DB_PASSWORD || 'Kuntay1992.';
    const database = process.env.DB_DATABASE || 'stockke_pos';

    // Verbindung zur MySQL-Instanz herstellen (ohne Datenbank)
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    // Datenbank erstellen, falls sie noch nicht existiert
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`Datenbank '${database}' wurde erstellt oder existiert bereits.`);

    // Verbindung schließen
    await connection.end();
  } catch (error) {
    console.error('Fehler beim Erstellen der Datenbank:', error);
  }
}

// Skript ausführen
createDatabase();