// server.ts
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

const app = express();
app.use(express.json());

// Connect to SQLite database

export let db: Database<sqlite3.Database, sqlite3.Statement>;

/**
 * Modifications to make
 * Add (creation_time, order_status) in order
 * order_status -> 'PLACED', 'DISPATCHED', 'DELIVERED', 'CANCELED'
 */

export const initDB = async () => {

  db = await open({
    filename: 'database.sqlite',
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
  CREATE TABLE IF NOT EXISTS tenant (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE CHECK (LENGTH(name) >= 3),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, 
    user_type TEXT NOT NULL CHECK(user_type in ('ADMIN', 'OWNER', 'CUSTOMER')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email TEXT NOT NULL,
    tenant_id INTEGER,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
  );

  CREATE TABLE IF NOT EXISTS address (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    user_id INTEGER,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN('TSHIRT', 'PANT', 'SHOE')),
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    name TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    tenant_id INTEGER,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity INTEGER DEFAULT 0,
    product_id,
    user_id INTEGER,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES product(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_amount INTEGER NOT NULL,
    address TEXT NOT NULL,
    user_id INTEGER,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS order_link_product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id)
  );
  `);
}
