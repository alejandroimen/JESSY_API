const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/Categorias');

router.get('/', categoriasController.getAllCategorias);
router.get('/:id', categoriasController.getProductos);// este es para la busqueda por id
router.post('/', categoriasController.addCategoria);
router.put('/:id', categoriasController.updateCategoria);
router.delete('/:id', categoriasController.deleteCategoria);

module.exports = router;

