const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas');

router.post('/ML', ventasController.getVentasFromML);
router.post('/between', ventasController.getVentasBetween)
router.get('/', ventasController.getAllVentas); 
router.get('/:id', ventasController.getVentaByID)

 
module.exports = router;
