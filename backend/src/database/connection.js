import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database/phd.sqlite');

// Criar conexão com sqlite3
const sqliteDb = new sqlite3.Database(dbPath);

// Wrapper para tornar métodos síncronos/promisificados
const db = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        return new Promise((resolve, reject) => {
          sqliteDb.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
          });
        });
      },
      get: (...params) => {
        return new Promise((resolve, reject) => {
          sqliteDb.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      },
      all: (...params) => {
        return new Promise((resolve, reject) => {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      }
    };
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      sqliteDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  close: () => {
    return new Promise((resolve, reject) => {
      sqliteDb.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  pragma: (command) => {
    return new Promise((resolve, reject) => {
      sqliteDb.exec(`PRAGMA ${command}`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

export default db;
