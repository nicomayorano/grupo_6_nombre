const { Router } = require('express');
const productController = require('../controllers/productController');
const multer = require('../middlewares/multer');
const notLogged = require('../middlewares/notLogged');
const productValidation = require('../middlewares/productValidation');
const imageValidation = require('../middlewares/imageValidation');

const productRouter = new Router();

productRouter.get('/', productController.index);
productRouter.get('/search', productController.search);
productRouter.get('/new', notLogged, productController.newForm);
productRouter.get('/:id', productController.detail);
productRouter.post('/', notLogged, multer('productsImages', { size: 500_000, files: 6 }), productValidation, imageValidation, productController.new);
productRouter.get('/cart/:id', notLogged, productController.cart);
productRouter.get('/:id/edit', notLogged, productController.editForm);
productRouter.put('/:id', notLogged, multer('productsImages', { size: 500_000, files: 6 }), productValidation, imageValidation, productController.edit);
productRouter.delete('/:id', notLogged, productController.delete);

module.exports = productRouter;
