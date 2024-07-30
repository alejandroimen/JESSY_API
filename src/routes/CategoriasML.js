const express = require('express');
const router = express.Router();
const CategoriasML= require('../controllers/CategoriasML');

router.get('/', CategoriasML.getCategoriasML);
router.delete('/:id', CategoriasML.deleteCategoriasML);


module.exports = router;
