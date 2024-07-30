const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
    if (err) throw err;
    //console.log('Comentarios-Conexión a la BD establecida');
  });
// Obtener todas las Comentarios
exports.getAllComentarios = (req, res) => {
  db.query('SELECT * FROM Comentarios', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener las Comentarios');
      throw err;
    }
    res.json(result);
  });
};


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

// Agregar una nueva Comentario
exports.addComentario = [authenticateJWT, (req, res) => {
  const newComentario = req.body;
  db.query('INSERT INTO Comentarios SET ?', newComentario, (err, result) => {
    if (err) {
      res.status(500).send('Error al agregar la Comentario');
      return;
    }
    res.status(201).send('Comentario agregada correctamente');
  });
}];

// Actualizar una Comentario existente
exports.updateComentario = [authenticateJWT, (req, res) => {
  const ComentarioId = req.params.id;
  const updatedComentario = req.body;
  db.query('UPDATE FROM Comentarios SET ? WHERE id = ?', [updatedComentario, ComentarioId], (err, result) => {
    if (err) {
      return res.status(500).send('Error al actualizar la Comentario');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.send('Comentario actualizada correctamente');
  });
}];

// Eliminar una Comentario
exports.deleteComentario = [authenticateJWT, (req, res) => {
  const ComentarioId = req.params.id;
  db.query('DELETE FROM Comentarios WHERE id = ?', ComentarioId, (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar la Comentario');
      throw err;
    }
    res.send('Comentario eliminada correctamente');
  });
}]; 
