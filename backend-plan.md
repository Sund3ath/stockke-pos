# Backend-Server-Plan für Stockke POS

Dieser Plan beschreibt die Implementierung eines Backend-Servers mit MySQL-Datenbankintegration für das Stockke POS-System. Der Server wird alle benötigten Tabellen in der MySQL-Datenbank erstellen und eine GraphQL-API für die Kommunikation mit dem Frontend bereitstellen.

## 1. Technologie-Stack

```mermaid
graph TD
    A[Frontend: React + TypeScript] --> B[GraphQL API]
    B --> C[Node.js + Express + Apollo Server]
    C --> D[TypeORM]
    D --> E[MySQL Datenbank]
```

Die Hauptkomponenten unseres Stacks sind:
- **Node.js mit Express**: Als grundlegende Server-Plattform
- **Apollo Server**: Für die GraphQL-API-Implementierung
- **TypeORM**: Für die typsichere Datenbankinteraktion
- **MySQL**: Als zugrundeliegende Datenbank

## 2. Datenbankstruktur

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string password_hash
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        int id PK
        string name
        decimal price
        string category
        string image_url
        string description
        boolean in_stock
        decimal tax_rate
        timestamp created_at
        timestamp updated_at
    }
    
    CUSTOMERS {
        int id PK
        string name
        string email
        string phone
        string address
        string notes
        date last_visit
        timestamp created_at
        timestamp updated_at
    }
    
    TABLES {
        int id PK
        string name
        boolean occupied
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        int id PK
        decimal total
        string status
        timestamp order_time
        string payment_method
        decimal cash_received
        string tse_signature
        int table_id FK
        string note
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_order
        string note
        timestamp created_at
        timestamp updated_at
    }
    
    SETTINGS {
        int id PK
        int user_id FK
        string language
        string currency_code
        string currency_symbol
        string currency_position
        string timezone
        string tse_api_key
        string tse_device_id
        string tse_environment
        string company_name
        string company_address
        string company_phone
        string company_email
        string company_tax_id
        string receipt_header
        string receipt_footer
        boolean receipt_show_logo
        boolean tax_enabled
        decimal tax_rate
        boolean printer_enabled
        string printer_name
        boolean module_tse
        boolean module_customers
        string lieferando_api_key
        string lieferando_restaurant_id
        string lieferando_api_url
        timestamp created_at
        timestamp updated_at
    }
    
    TSE_TRANSACTIONS {
        int id PK
        int order_id FK
        timestamp transaction_time
        string signature
        decimal total
        timestamp created_at
        timestamp updated_at
    }
    
    DAILY_SALES {
        int id PK
        date sale_date
        decimal total
        int order_count
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORY_SALES {
        int id PK
        date sale_date
        string category
        decimal total
        int quantity
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS ||--o{ ORDER_ITEMS : enthält
    ORDERS }o--|| TABLES : platziert_an
    ORDER_ITEMS }o--|| PRODUCTS : bezieht_sich_auf
    ORDERS ||--o| TSE_TRANSACTIONS : hat
    USERS ||--o{ SETTINGS : besitzt
```

