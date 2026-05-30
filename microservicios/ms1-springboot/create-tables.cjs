const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'readflow-mysql.mysql.database.azure.com',
  port: 3306,
  database: process.env.MYSQL_DB || 'readflow_db',
  user: process.env.MYSQL_USER || 'readflowadmin',
  password: process.env.MYSQL_PASSWORD || 'ReadFlow2026!',
  ssl: { rejectUnauthorized: false }
};

async function run() {
  const conn = await mysql.createConnection(config);
  console.log('Conectado a MySQL');

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255),
      title VARCHAR(255),
      author VARCHAR(255),
      category VARCHAR(255),
      description TEXT,
      language VARCHAR(255),
      cover_url VARCHAR(1000),
      pdf_url VARCHAR(1000),
      pdf_file_name VARCHAR(255),
      pdf_file_size BIGINT,
      total_pages INT,
      current_status VARCHAR(255),
      is_public TINYINT(1)
    )
  `);
  console.log('Tabla books OK');

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      label VARCHAR(255)
    )
  `);
  console.log('Tabla categories OK');

  const [rows] = await conn.execute('SELECT COUNT(*) AS cnt FROM categories');
  if (rows[0].cnt === 0) {
    await conn.execute(`
      INSERT INTO categories (name, label) VALUES
        ('Ficcion',    'Ficción'),
        ('No Ficcion', 'No Ficción'),
        ('Ciencia',    'Ciencia'),
        ('Historia',   'Historia'),
        ('Tecnologia', 'Tecnología'),
        ('Literatura', 'Literatura'),
        ('Filosofia',  'Filosofía'),
        ('Arte',       'Arte')
    `);
    console.log('Categorías insertadas');
  } else {
    console.log('Categorías ya existen, skipping');
  }

  await conn.end();
  console.log('Listo');
}

run().catch(err => { console.error(err); process.exit(1); });
