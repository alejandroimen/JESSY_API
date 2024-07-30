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
    //console.log('Deseos-Conexión a la BD establecida');
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


// Obtener todas las listas de deseos
exports.getAllListaDeseos = (req, res) => {
  db.query('SELECT * FROM Deseos', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener las listas de deseos');
      throw err;
    }
    res.json(result);
  });
};

// Agregar una nueva lista de deseos
exports.addListaDeseo = [authenticateJWT, (req, res) => {
  const newListaDeseo = req.body;
  db.query('INSERT INTO Deseos SET ?', newListaDeseo, (err, result) => {
    if (err) {
      res.status(500).send('Error al agregar la lista de deseos');
      return;
    }
    res.status(201).send('Lista de deseos agregada correctamente');
  });
}];

// Actualizar una lista de deseos existente
exports.updateListaDeseo = [authenticateJWT, (req, res) => {
  const listaDeseoId = req.params.id;
  const updatedListaDeseo = req.body;
  db.query('UPDATE FROM Deseos SET ? WHERE id = ?', [updatedListaDeseo, listaDeseoId], (err, result) => {
    if (err) {
      return res.status(500).send('Error al actualizar la lista de deseos');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.send('Lista de deseos actualizada correctamente');
  });
}];

// Eliminar una lista de deseos
exports.deleteListaDeseo = [authenticateJWT, (req, res) => {
  const listaDeseoId = req.params.id;
  db.query('DELETE FROM Deseos WHERE id = ?', listaDeseoId, (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar la lista de deseos');
      throw err;
    }
    res.send('Lista de deseos eliminada correctamente');
  });
}];
