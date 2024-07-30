const express = require('express');
const nodemon = require('nodemon');
const bodyParser = require('body-parser');
const cors = require('cors');
const usersJWTRoutes = require('./src/routes/users_jwt');
const ventasRoutes = require('./src/routes/ventas');
const proveedoresRoutes = require('./src/routes/proveedores');
const categoriasRoutes= require('./src/routes/Categorias');
const comprasRoutes = require('./src/routes/Compras');
const listadeDeseosRoutes = require('./src/routes/ListaDeDeseos');
//const productosRoutes = require('./routes/productos');
const productosMLRoutes = require('./src/routes/productoML');
const comentariosRoutes = require('./src/routes/Comentarios');
const categoriasML = require('./src/routes/CategoriasML');
const { refreshAccessToken } = require('./src/tokens');
require('dotenv').config();

const app = express();
const port = process.env.DB_PORT || 3000;
// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',  // URL del entorno local
  'https://jessy.integrador.xyz'  // URL del entorno de producción
];

app.use(cors({
  origin: 
  (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        // Permitir el origen
        callback(null, true);
    } else {
        // Rechazar el origen
        callback(new Error('Not allowed by CORS'));
    }
},
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permite estos métodos
  credentials: true // Si necesitas enviar cookies o autenticación HTTP
})); 

//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' })); // Ajusta el límite según tus necesidades
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/usersJWT', usersJWTRoutes);
app.use('/ventas', ventasRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/compras', comprasRoutes);
app.use('/listadeseos', listadeDeseosRoutes);
//app.use('/productos', productosRoutes);
app.use('/comentarios', comentariosRoutes);
app.use('/products',productosMLRoutes); //aqui esta
app.use('/categoriasML', categoriasML);

app.listen(port, () => {
  console.log(`Servidor Express en ejecución en http://localhost:${port}`);
});

