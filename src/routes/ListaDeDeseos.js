const express = require('express');
const router = express.Router();
const listaDeseosController = require('../controllers/ListaDeDeseos');

router.get('/', listaDeseosController.getAllListaDeseos);
router.post('/', listaDeseosController.addListaDeseo);
router.put('/:id', listaDeseosController.updateListaDeseo);
router.delete('/:id', listaDeseosController.deleteListaDeseo);

module.exports = router;
