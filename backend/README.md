# Stockke POS Backend

Dies ist das Backend für das Stockke POS-System. Es stellt eine GraphQL-API bereit, die mit einer MySQL-Datenbank kommuniziert.

## Technologie-Stack

- **Node.js**: JavaScript-Laufzeitumgebung
- **Express**: Web-Framework für Node.js
- **Apollo Server**: GraphQL-Server
- **TypeORM**: ORM für TypeScript und JavaScript
- **MySQL**: Relationale Datenbank
- **JWT**: JSON Web Tokens für die Authentifizierung

## Voraussetzungen

- Node.js (v14 oder höher)
- MySQL (v5.7 oder höher)
- npm oder yarn

## Installation

1. Klone das Repository und wechsle in das Backend-Verzeichnis:

```bash
git clone <repository-url>
cd stockke-pos/backend
```

2. Installiere die Abhängigkeiten:

```bash
npm install
```

3. Konfiguriere die Umgebungsvariablen:

Kopiere die `.env.example`-Datei zu `.env` und passe die Werte an:

```bash
cp .env.example .env
```

Bearbeite die `.env`-Datei und setze die entsprechenden Werte:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=Kuntay1992.
DB_DATABASE=stockke_pos

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret
JWT_SECRET=dein_geheimer_schluessel
JWT_EXPIRES_IN=1d
```

## Datenbank einrichten

1. Erstelle die Datenbank:

```bash
npm run create-db
```

2. Führe die Migrationen aus:

```bash
npm run migration:run
```

3. Füge Beispieldaten ein:

```bash
npm run seed
```

Oder führe alle Schritte auf einmal aus:

```bash
npm run setup
```

## Entwicklung

Starte den Entwicklungsserver:

```bash
npm run dev
```

Der Server ist dann unter http://localhost:4000/graphql erreichbar.

## Produktion

1. Baue das Projekt:

```bash
npm run build
```

2. Starte den Produktionsserver:

```bash
npm start
```

## Authentifizierung

Die API verwendet JWT für die Authentifizierung. Um auf geschützte Ressourcen zuzugreifen, muss ein gültiger JWT-Token im Authorization-Header mitgesendet werden:

```
Authorization: Bearer <token>
```

Ein Token kann über die `login`-Mutation erhalten werden:

```graphql
mutation {
  login(input: { username: "admin", password: "admin123" }) {
    token
    user {
      id
      username
      role
    }
  }
}
```

## Standard-Benutzer

Nach dem Seeding ist ein Admin-Benutzer verfügbar:

- **Benutzername**: admin
- **Passwort**: admin123

## Lizenz

[MIT](LICENSE)