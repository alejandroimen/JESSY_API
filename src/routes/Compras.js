const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/Compras');

router.get('/', comprasController.getAllCompras);
router.post('/', comprasController.addCompra);
router.put('/:id', comprasController.updateCompra);
router.delete('/:id', comprasController.deleteCompra);

module.exports = router;
