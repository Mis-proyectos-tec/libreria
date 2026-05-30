const sql = require('mssql');

const config = {
  server: process.env.SQL_HOST || 'readflow-db-srv.database.windows.net',
  database: process.env.SQL_DB || 'readflow-db',
  user: process.env.SQL_USER || 'readflowadmin',
  password: process.env.SQL_PASSWORD || 'ReadFlow2026!',
  options: { encrypt: true, trustServerCertificate: false }
};

async function run() {
  const pool = await sql.connect(config);
  console.log('Conectado a Azure SQL');

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'books')
    CREATE TABLE books (
      id BIGINT IDENTITY(1,1) PRIMARY KEY,
      user_id NVARCHAR(255),
      title NVARCHAR(255),
      author NVARCHAR(255),
      category NVARCHAR(255),
      description NVARCHAR(MAX),
      language NVARCHAR(255),
      cover_url NVARCHAR(1000),
      pdf_url NVARCHAR(1000),
      pdf_file_name NVARCHAR(255),
      pdf_file_size BIGINT,
      total_pages INT,
      current_status NVARCHAR(255),
      is_public BIT
    )
  `);
  console.log('Tabla books OK');

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories')
    CREATE TABLE categories (
      id BIGINT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(255),
      label NVARCHAR(255)
    )
  `);
  console.log('Tabla categories OK');

  const result = await pool.request().query('SELECT COUNT(*) AS cnt FROM categories');
  if (result.recordset[0].cnt === 0) {
    await pool.request().query(`
      INSERT INTO categories (name, label) VALUES
        ('Ficcion',    N'Ficción'),
        ('No Ficcion', N'No Ficción'),
        ('Ciencia',    N'Ciencia'),
        ('Historia',   N'Historia'),
        ('Tecnologia', N'Tecnología'),
        ('Literatura', N'Literatura'),
        ('Filosofia',  N'Filosofía'),
        ('Arte',       N'Arte')
    `);
    console.log('Categorías insertadas');
  } else {
    console.log('Categorías ya existen, skipping');
  }

  await sql.close();
  console.log('Listo');
}

run().catch(err => { console.error(err); process.exit(1); });
