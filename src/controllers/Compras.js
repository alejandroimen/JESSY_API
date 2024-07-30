const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
    if (err) throw err;
    console.log('Compras-Conexión a la BD establecida');
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

// Obtener todas las compras
exports.getAllCompras = (req, res) => {
  db.query('SELECT * FROM Compras', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener las compras');
      throw err;
    }
    res.json(result);
  });
};

// Agregar una nueva compra
exports.addCompra = [authenticateJWT, (req, res) => {
  const { invertido, id_proveedores, cantidad_Productos, idProducto, fechaCompra } = req.body;

  db.query('INSERT INTO Compras SET ?', { invertido, id_proveedores, cantidad_Productos, idProducto, fechaCompra }, (err, result) => {
    if (err) {
      res.status(500).send('Error al agregar la compra');
      return;
    }
    console.log("id del producto:", idProducto)
    // Actualizar el stock en la base de datos
    db.query('UPDATE Producto SET stock = stock + ? WHERE id_producto = ?', [cantidad_Productos, idProducto], (err) => {
      if (err) {
        res.status(500).send('Error al actualizar el stock en la base de datos');
        return;
      }

      // Obtener el id_ML del producto
      db.query('SELECT id_ML FROM Producto WHERE id_producto = ?', [idProducto], async (err, results) => {
        if (err) {
          res.status(500).send('Error al obtener el id_ML del producto');
          return;
        }

        const id_ML = results[0].id_ML;
        
        try {
          // Actualizar el stock en Mercado Libre
          const accessToken = process.env.MERCADO_LIBRE_ACCESS_TOKEN; // Asegúrate de que el token esté configurado en tu archivo .env
          await axios.put(`https://api.mercadolibre.com/items/${id_ML}`, {
            available_quantity: cantidad_Productos
          }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          res.status(201).send('Compra agregada y stock actualizado correctamente');
        } catch (error) {
          res.status(500).send('Error al actualizar el stock en Mercado Libre');
        }
      });
    });
  });
}];

// Actualizar una compra existente
exports.updateCompra = [authenticateJWT, (req, res) => {
  const compraId = req.params.id;
  const updatedCompra = req.body;
  db.query('UPDATE Compras SET ? WHERE idCompra = ?', [updatedCompra, compraId], (err, result) => {
    if (err) {
      return res.status(500).send('Error al actualizar la compra');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Compra no encontrada');
    }
    res.send('Compra actualizada correctamente');
  });
}];

// Eliminar una compra
exports.deleteCompra = [authenticateJWT, (req, res) => {
  const compraId = req.params.id;
  db.query('DELETE FROM Compras WHERE idCompra = ?', compraId, (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar la compra');
      throw err;
    }
    res.send('Compra eliminada correctamente');
  });
}];
