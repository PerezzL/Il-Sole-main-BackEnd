const postgres = require('postgres');

// Configuración que sabemos que funciona
const connectionString = 'postgres://postgres.xfsffvercadqouvctkhw:jH79Zsc8IsZ6hkT8@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
const sql = postgres(connectionString);

module.exports = sql;
