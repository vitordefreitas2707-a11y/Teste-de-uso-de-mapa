import pool from "../config/db.js";

export const getMarcadores = async () => {
  const result = await pool.query('SELECT * FROM "marcadores"');
  return result.rows;
};

export const createMarcador = async (nome, descricao, latitude, longitude) => {
  const result = await pool.query(
    'INSERT INTO "marcadores" (nome, descricao, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *',
    [nome, descricao, latitude, longitude]
  );
  return result.rows[0];
};

export const deleteMarcador = async (id) => {
    const result = await pool.query('DELETE FROM "marcadores" WHERE id = $1', [id]);
  // rowCount mostra quantos registros o PostgreSQL removeu.
  return result.rowCount;
};