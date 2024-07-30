const mysql = require('mysql2');
const axios = require('axios');
const jwt = require('jsonwebtoken');
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
  //console.log('Categorias - Conexión a la BD establecida');
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

exports.getAllCategorias = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Categorias', (err, result) => {
    if (err) {
      return res.status(500).send('Error al obtener las categorías');
    }
    res.json(result);
  });
}];

exports.addCategoria = [authenticateJWT, (req, res) => { 
  const newCategoria = req.body;
  db.query('INSERT INTO Categorias SET ?', newCategoria, (err, result) => {
    if (err) {
      return res.status(500).send('Error al agregar la categoría');
    }
    res.status(201).send('Categoría agregada correctamente');
  });
}];

exports.updateCategoria = [authenticateJWT, (req, res) => {
  const categoriaId = req.params.id;
  const updatedCategoria = req.body;
  db.query('UPDATE Categorias SET ? WHERE id_Categorias = ?', [updatedCategoria, categoriaId], (err, result) => {
    if (err) {
      return res.status(500).send('Error al actualizar la categoría');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.send('Categoría actualizada correctamente');
  });
}];

exports.deleteCategoria = [authenticateJWT, (req, res) => {
  const categoriaId = req.params.id;
  db.query('DELETE FROM Categorias WHERE id_Categorias = ?', categoriaId, (err, result) => {
    if (err) {
      return res.status(500).send('Error al eliminar la categoría');
    }
    res.send('Categoría eliminada correctamente');
  });
}];
//Esta es la que necesitamos
exports.getProductos = async (req, res) => {
  console.log('Inicio de getProductos', req.params.id); // Log inicial
  try {
      // 1. Obtener el token de acceso
      const ACCESS_TOKEN = await getAccessToken();
      console.log('Token obtenido', ACCESS_TOKEN);

      // 2. Obtener el ID de la categoría de la solicitud
      const idCategoria = req.params.id; // Suponiendo que el ID de la categoría está en los parámetros de la URL
      console.log('ID de categoría:', idCategoria);

      // 3. Construir la URL para la solicitud de Mercado Libre (obtener IDs de productos)
      const url = `https://api.mercadolibre.com/users/1494235301/items/search`;
      const headers = {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
      };

      // 4. Realizar la solicitud GET para obtener los IDs de los productos
      const respuestaML = await axios.get(url, { headers });
      console.log('Respuesta de IDs de Mercado Libre:', respuestaML.data);

      // 5. Manejar la respuesta de Mercado Libre para obtener IDs
      if (!respuestaML.data || !respuestaML.data.results) {
          console.error('Error en la respuesta de IDs de Mercado Libre:', respuestaML);
          return res.status(respuestaML.status).json({ mensaje: 'Error al obtener IDs de productos de Mercado Libre' });
      }

      const productIds = respuestaML.data.results;
      console.log('IDs de productos:', productIds);

      // 6. Consultar cada producto individualmente y filtrar por categoría
      const productos = [];

      for (const productId of productIds) {
          const productUrl = `https://api.mercadolibre.com/items/${productId}`;
          try {
              const productResponse = await axios.get(productUrl, { headers });
              const product = productResponse.data;
              if (product.category_id === idCategoria) {
                  productos.push(product);
              }
          } catch (productError) {
              console.error(`Error al obtener el producto ${productId}:`, productError);
          }
      }

      // 7. Devolver la lista de productos filtrados
      return res.json({ productos });

  } catch (error) {
      // 8. Manejar errores
      console.error('Error en getProductos:', error); // Log de error
      if (error.response) { 
          res.status(error.response.status).json(error.response.data);
      } else {
          res.status(500).json({ mensaje: 'Error al comunicarse con la API de Mercado Libre', error: error.message });
      }
  }
};

/*
exports.getProductos = async (req, res) => {
  console.log('Inicio de getProductos', req.params.id); // Log inicial
  try {
      // 1. Obtener el token de acceso
      const ACCESS_TOKEN = await getAccessToken();
      console.log('Token obtenido', ACCESS_TOKEN);

      // 2. Obtener el ID de la categoría de la solicitud
      const idCategoria = req.params.id; // Suponiendo que el ID de la categoría está en los parámetros de la URL
      console.log('ID de categoría:', idCategoria);

      // 3. Construir la URL para la solicitud de Mercado Libre
      const url = `https://api.mercadolibre.com/users/1494235301/items/search`; //esta consulta muestra los id de mis productos y este para consultar el producto (recuerda jalar el id y hacer lo que te dije): https://api.mercadolibre.com/items/$ITEM_ID 
      const headers = {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
      };

      // 4. Realizar la solicitud GET a la API de Mercado Libre
      const respuestaML = await axios.get(url, { headers });
      console.log('Respuesta de Mercado Libre:', respuestaML.data);

      // 5. Manejar la respuesta de Mercado Libre
      if (!respuestaML.data || !respuestaML.data.results) {
          console.error('Error en la respuesta de Mercado Libre:', respuestaML);
          return res.status(respuestaML.status).json({ mensaje: 'Error al obtener productos de Mercado Libre' });
      }

      // 6. Manejar la respuesta exitosa (productos encontrados)
      return res.json({ productos: respuestaML.data.results });

  } catch (error) {
      // 7. Manejar errores
      console.error('Error en getProductos:', error); // Log de error
      if (error.response) {
          res.status(error.response.status).json(error.response.data);
      } else {
          res.status(500).json({ mensaje: 'Error al comunicarse con la API de Mercado Libre', error: error.message });
      }
  }
}; */
