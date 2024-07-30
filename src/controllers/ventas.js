const mysql = require('mysql2');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getTokens } = require('../tokens')
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  //console.log('Venta-Conexión a la BD establecida');
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
}

exports.getAllVentas = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Venta', (err, result) => {
    if (err) {
      console.error('Error al obtener las ventas', err);
      return res.status(500).send('Error al obtener las ventas');
    }
    res.json(result);
  });
}];

const addVenta = async (newVenta, productos) => {
  try {
    // Primera consulta (INSERT o REPLACE en la tabla Venta)
    const [result] = await db.promise().query('REPLACE INTO Venta SET ?', [newVenta]);

    for (const prod of productos) {
      const [rows] = await db.promise().query('SELECT * FROM Vendido WHERE idVenta = ?', [result.idVenta]);

      if (rows.length === 0) {
        let vendido = {
          idProductoML: prod.item.id,
          idVenta: [result.idVenta],
          cantidad: prod.quantity
        }
        await db.promise().query('INSERT INTO Vendido SET ?', vendido);
      }
    }

    return result;
  } catch (error) {
    console.error('Error al agregar la venta:', error);
    throw error;
  }
};

exports.getVentasFromML = async (req, res) => {
  const seller = '1922378338'
  const from = '2024-06-01T00:00:00.000-00:00'
  const to = req.body.to
  const token = await getAccessToken();
  const url = `https://api.mercadolibre.com/orders/search?seller=${seller}&order.date_created.from=${from}&order.date_created.to=${to}`;

  console.log('TOKEN ', token);
  let result = []
  try {
    console.log('Hola');
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Hola');
    result = response.data.results
    let success = response.status === 200 ? true : false
    console.log('Este es el resultado', result);

    for (const venta of result) {
      let newVenta = {
        idVenta: venta.id,
        fechaVenta: venta.date_created,
        total: venta.total_amount
      }
      let productos = venta.order_items

      try {
        await addVenta(newVenta, productos);
        console.log('Venta agregada:', venta.id);
      } catch (error) {
        console.error('Error al agregar la venta:', error, venta);
      }
    }

    return res.status(200).json({ success: success, data: result })
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un código de estado diferente a 2xx
      console.error('Error:', error.response.status);
      console.error('Mensaje:', error.response.data);
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      console.error('Error en la solicitud:', error.request);
    } else {
      // Algo pasó al configurar la solicitud
      console.error('Error en la configuración de la solicitud:', error.message);
    }
  }
}

exports.getVentaByID = async (req, res) => {
  try {
    const ACCESS_TOKEN = await getAccessToken();
    console.log('Token obtenido', ACCESS_TOKEN);
    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    };
    const idVenta = req.params.id;

    const [rows] = await db.promise().query('SELECT p.id_ML, p.title, p.price, v.cantidad FROM Vendido AS v INNER JOIN Producto AS p ON idProductoML = id_ML WHERE idVenta = ?', [idVenta]);
    console.log('Rows en nuestra bd', rows);
    const productos = [];

    for (const prod of rows) {
      const productUrl = `https://api.mercadolibre.com/items/${prod.id_ML}`;
      try {
        const productResponse = await axios.get(productUrl, { headers });
        const product = productResponse.data;

        console.log('prod de nuestr bd ', prod);
        console.log('productResopnse ', product.id);
        if (product.id === prod.id_ML) {
          productos.push({ product: product, cantidad: prod.cantidad });
        }
      } catch (productError) {
        console.error(`Error al obtener el producto`, productError);
      }
    }
    return res.json({ productos });
  } catch (error) {
    console.error('Error en getProductos:', error); // Log de error
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ mensaje: 'Error al comunicarse con la API de Mercado Libre', error: error.message });
    }
  }
};

exports.getVentasBetween = async (req, res) => {
  console.log('entro a la func');
  try {
    console.log('entro al try');
    const old = req.body.old
    const med = req.body.med
    const last = req.body.last

    const [firstMonth] = await db.promise().query('SELECT * FROM Venta WHERE fechaVenta > ? AND fechaVenta < ?', [old, med]);
    console.log('paso1', firstMonth);
    const [secondMonth] = await db.promise().query('SELECT * FROM Venta WHERE fechaVenta > ? AND fechaVenta < ?', [med, last]);
    console.log('paso2', secondMonth);
    const [lastMonth] = await db.promise().query('SELECT * FROM Venta WHERE fechaVenta > ?', [last]);
    console.log('paso3', lastMonth);

    return res.json({ first: firstMonth, second: secondMonth, last: lastMonth })
  } catch (error) {
    console.error('Error en getProductos:', error); // Log de error
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ mensaje: 'Error al comunicarse con la API de Mercado Libre', error: error.message });
    }

  }
}