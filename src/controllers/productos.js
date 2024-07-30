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
  //console.log('Productos - Conexión a la BD establecida');
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

exports.getAllProductos = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Producto', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener los productos');
      throw err;
    }
    res.json(result);
  });
}];

exports.addProducto = [authenticateJWT, (req, res) => {
  const newProducto = req.body;
  db.query('INSERT INTO Producto SET ?', newProducto, (err, result) => {
    if (err) {
      res.status(500).send('Error al agregar el producto');
      throw err;
    }
    res.status(201).send('Producto agregado correctamente');
  });
}];

exports.updateProducto = [authenticateJWT, (req, res) => {
  const productoId = req.params.id;
  const updatedProducto = req.body;
  db.query('UPDATE Producto SET ? WHERE id_producto = ?', [updatedProducto, productoId], (err, result) => {
    if (err) {
      return res.status(500).send('Error al actualizar el producto');
      
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.send('Producto actualizado correctamente');
  });
}];

exports.deleteProducto = [authenticateJWT, (req, res) => {
  const productoId = req.params.id;
  db.query('DELETE FROM Producto WHERE id_producto = ?', productoId, (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar el producto');
      throw err;
    }
    res.send('Producto eliminado correctamente');
  });
}];

exports.getIdProducto = [authenticateJWT, (req, res) => {
  const productoId = req.params.id;
  db.query('SELECT * FROM Producto WHERE id_producto = ?', [productoId], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener/encontrar el producto');
      throw err;
    }
    res.json({
      message: 'Producto encontrado correctamente:',
      data: result
    });
  });
}];

