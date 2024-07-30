const express = require('express');
const router = express.Router();
const usersJWTController = require('../controllers/users_jwt');

// Rutas para los endpoints CRUD
router.get('/', usersJWTController.getAllUsers);
router.get('/role', usersJWTController.getUserRole);
router.post('/login', usersJWTController.login);
router.post('/', usersJWTController.addUser); 

module.exports = router;

