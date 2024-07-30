const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos');

// Rutas para los endpoints CRUD
router.get('/', productosController.getAllProductos);
router.get('/:id', productosController.getIdProducto);
router.post('/', productosController.addProducto);
router.put('/:id', productosController.updateProducto);
router.delete('/:id', productosController.deleteProducto);

module.exports = router;

