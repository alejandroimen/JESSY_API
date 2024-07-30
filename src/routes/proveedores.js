const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedores');

// Rutas para los endpoints CRUD
router.get('/', proveedoresController.getAllProveedores);
router.post('/', proveedoresController.addProveedor);
router.put('/:id', proveedoresController.updateProveedor);
router.delete('/:id', proveedoresController.deleteProveedor);

module.exports = router;
