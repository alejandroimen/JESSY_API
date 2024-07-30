const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/Comentarios');

router.get('/', comentariosController.getAllComentarios);
router.post('/', comentariosController.addComentario);
router.put('/:id', comentariosController.updateComentario);
router.delete('/:id', comentariosController.deleteComentario);

module.exports = router;
