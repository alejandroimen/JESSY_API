//const express = require('express'); //estoy usando nodemon
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();
/*
const app = express();
app.use(express.json()); */

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  console.log('CategoriasML - Conexión a la BD establecida');
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Prohibido (token inválido)
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // No autorizado (sin token)
  }
};

// Método GET para obtener todas las categorías
exports.getCategoriasML = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM CategoriasML', (err, result) => {
    if (err) {
      return res.status(500).send('Error al obtener las categorías');
    }
    res.json(result);
  });
}];

// Método DELETE para eliminar una categoría por id
exports.deleteCategoriasML = [authenticateJWT, (req, res) => {
  const categoriaId = req.params.id;
  db.query('DELETE FROM CategoriasML WHERE category_id = ?', categoriaId, (err, result) => {
    if (err) {
      return res.status(500).send('Error al eliminar la categoría');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Categoría no encontrada');
    }
    res.send('Categoría eliminada correctamente');
  });
}];

