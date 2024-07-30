const express = require('express');
const router = express.Router();
const multer = require('multer');
const productosController = require('../controllers/app');

const storage = multer.memoryStorage();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB, ajusta según tus necesidades
});

router.post('/', upload.single('image'), productosController.createProduct);
router.get('/:id', productosController.getProduct);
//router.get('/client', productosController.getProductsClient);
router.put('/:id', upload.single('image'),productosController.updateProduct);
router.get('/',productosController.getAllProducts);
router.delete('/:id', productosController.deleteProduct);

module.exports = router;



/*const express = require('express');
const router = express.Router();
const productosController = require('../controllers/app');

router.post('/', productosController.createProduct);
router.get('/:id', productosController.getProduct);
router.put('/:id', productosController.updateProduct);

module.exports = router;*/

