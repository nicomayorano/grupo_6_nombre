/* eslint-disable no-console */
const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');

const productController = {
  index: (req, res) => {
    Product.fetchAllFromJson()
      .then((products) => res.render('products/products', { products }))
      .catch((err) => console.error(err));
  },

  search: async (req, res) => {
    const search = req.query.city;
    try {
      const products = await Product.fetchAllFromJson();
      const ciudadBuscada = products.filter((p) => p.city.toLowerCase()
        .trim().includes(search.toLowerCase().trim()));
      res.render('products/products-select', { search, ciudadBuscada });
    } catch {
      console.error('Error');
    }
  },

  detail: (req, res) => {
    Product.getById(Number(req.params.id))
      .then((property) => {
        res.render('products/detail', { property });
      })
      .catch((err) => console.error(err));
  },

  carrito: (req, res) => {
    Product.getById(Number(req.params.id))
      .then((property) => {
        res.render('products/cart', { property });
      })
      .catch((err) => console.error(err));
  },

  newForm: (req, res) => {
    res.render('products/new');
  },

  new: (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const property = {
        id: undefined,
        user_id: User.getByEmail(req.session.user).id,
        type: req.body.type,
        max_guests: Number(req.body.max_guests),
        price: Number(req.body.price),
        description: req.body.description,
        images: [],
        province: req.body.province,
        city: req.body.city,
        address: req.body.address,
      };
      Product.getNewId()
        .then((value) => {
          property.id = value;

          if (req.files.length) {
            for (let i = 0; i < req.files.length; i += 1) {
              property.images.push(req.files[i].filename);
            }
          } else {
            property.images.push('default.jpg');
          }

          Product.add(property);
        })
        .then(() => res.redirect('/users'))
        .catch((err) => console.error(err));
    } else {
      const priorInput = { ...req.body };
      res.render('products/new', { errors: errors.mapped(), priorInput });
    }
  },
  editForm: (req, res) => {
    Product.getById(Number(req.params.id))
      .then((property) => {
        res.render('products/edit', { property });
      })
      .catch((err) => console.error(err));
  },
  edit: (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      Product.getById(Number(req.params.id))
        .then((prop) => {
          const property = prop;
          // Elimina del objeto todas las amenidades
          const amenities = ['wifi', 'room_service', 'breakfast', 'pets', 'garage', 'linens', 'heating', 'air_conditioning', 'pool', 'grill', 'province', 'city'];
          for (let i = 0; i < amenities.length; i += 1) {
            delete property[amenities[i]];
          }

          Object.assign(property, req.body);
          property.price = Number(req.body.price);
          property.max_guests = Number(req.body.max_guests);

          if (req.files.length) {
            Promise.all(Product.removeOldImages(property.images))
              .then(() => console.log('Log: succesfully removed images from disk after product edition'));
            property.images = [];
            for (let i = 0; i < req.files.length; i += 1) {
              property.images.push(req.files[i].filename);
            }
          }

          Product.edit(req.params.id, property)
            .then(() => {
              res.redirect('/users');
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
    }
    res.render('products/edit', { errors: errors.mapped(), priorInput: req.body });
  },
  delete: (req, res) => {
    Product.getById(req.params.id)
      .then((property) => Promise.all(Product.removeOldImages(property.images)))
      .then(() => console.log('Log: succesfully removed images from disk after product deletion'))
      .catch((err) => console.error(err));
    Product.remove(Number(req.params.id))
      .then(() => res.redirect('/users'))
      .catch((err) => console.error(err));
  },
};

module.exports = productController;
