const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { getTokens } = require('../tokens');
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

const getAccessToken = async () => {
  const tokens = await getTokens();
  return tokens.access_token;
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
  //console.log('req.body: ', req.body)

  db.query('INSERT INTO Compras SET ?', { invertido, id_proveedores, cantidad_Productos, idProducto, fechaCompra }, (err, result) => {
    if (err) {
      res.status(500).send('Error al agregar la compra');
      return;
    }
    
    db.query('SELECT available_quantity FROM Producto WHERE id_producto = ?', [idProducto], (err, productResult) => {
      if (err) {
        res.status(500).send('Error al obtener el available_quantity del producto');
        return;
      }
  
      const currentAvailableQuantity = productResult[0].available_quantity;
      const cantidad_Productos1 = currentAvailableQuantity + cantidad_Productos;
      
    // Actualizar el stock en la base de datos
    db.query('UPDATE Producto SET available_quantity = available_quantity + ? WHERE id_producto = ?', [cantidad_Productos1, idProducto], (err) => {
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
         console.log('id_ML:', id_ML)
         console.log('cantidad productos', cantidad_Productos);
         const accessToken = await getAccessToken();
         console.log('Token:', accessToken);
       try {
          // Actualizar el stock en Mercado Libre
          console.log('Hola mundo')
          const respuestaML = await axios.put(`https://api.mercadolibre.com/items/${id_ML}`, { //
            available_quantity: cantidad_Productos1
          }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          await new Promise(resolve => setTimeout(resolve, 5000));
          console.log('respuesta', respuestaML.res); //
          res.status(201).send('Compra agregada y stock actualizado correctamente');
        } catch (error) {
          console.log(error);
          console.log(error.response ? error.response.data : error.message);

          res.status(500).send('Error al actualizar el stock en Mercado Libre');
        } 
      });
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
