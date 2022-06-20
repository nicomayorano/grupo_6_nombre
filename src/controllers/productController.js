/* eslint-disable no-console */
const { validationResult } = require('express-validator');
const { Products, Op, Amenities } = require('../database/index');

const AMENITIES = ['wifi', 'room_service', 'breakfast', 'pets', 'garage', 'linens', 'heating', 'air_conditioning', 'pool', 'grill'];

const productController = {
  index: (req, res) => {
    const products = [];
    Products.findAll({
      attributes: '',
      include: [{
        association: 'Images',
        attributes: { exclude: ['product_id', 'updated_at'] },
      }, {
        association: 'Amenities',
        attributes: { exclude: ['product_id', 'updated_at'] },
      }],
    })
      .then((result) => {
        result.forEach((elem) => {
          products.push(elem.dataValues);
        });
        res.render('products/products', { products });
      })
      .catch((err) => console.error(err));
  },

  search: (req, res) => {
    Products.findAll({
      where: {
        city: {
          [Op.iLike]: req.query.city,
        },
      },
      include: [{
        association: 'Images',
        attributes: { exclude: ['product_id', 'updated_at'] },
      }],
    })
      .then((result) => res.render('products/products-select', { search: String(req.query.city), ciudadBuscada: result?.dataValues }))
      .catch((error) => console.error(error));
  },

  detail: (req, res) => {
    Products.findByPk(req.params.id)
      .then((property) => res.render('products/detail', { property: property?.dataValues }))
      .catch((err) => console.error(err));
  },

  cart: (req, res) => {
    Products.findByPk(req.params.id)
      .then((property) => res.render('products/cart', { property: property?.dataValues }))
      .catch((err) => console.error(err));
  },

  newForm: (req, res) => res.render('products/new'),

  // eslint-disable-next-line consistent-return
  new: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.errors = errors.mapped();
    }

    if (res.locals.errors) {
      const priorInput = { ...req.body };
      return res.render('products/new', { priorInput });
    }
    const images = [];
    if (req.files.length === 0) {
      images.push({ image: 'default.jpg' });
    } else {
      for (let i = 0; i < req.files.length; i += 1) {
        images.push({ image: req.files[i].filename });
      }
    }

    const proAmenities = {};
    for (let i = 0; i < AMENITIES.length; i += 1) {
      if (req.body[AMENITIES[i]] === 'on') {
        Object.defineProperty(proAmenities, AMENITIES[i], {
          value: true,
          enumerable: true,
        });
      }
    }

    const prod = await Products.create({
      user_id: req.session.user.id,
      max_guests: req.body.max_guests,
      price: Number(req.body.price),
      description: req.body.description,
      province: req.body.province,
      city: req.body.city,
      address: req.body.address,
      type: req.body.type,
      Images: images,
    }, {
      include: {
        association: 'Images',
      },
    });
    await Amenities.create({
      product_id: prod.id,
      ...proAmenities,
    });
    res.redirect('/users');
  },

  editForm: (req, res) => {
    Products.findByPk(req.params.id, {
      include: [{
        association: 'Images',
      }, {
        association: 'Amenities',
      }],
    })
      .then((property) => res.render('products/edit', { property: property?.dataValues }))
      .catch((err) => console.error(err));
  },

  edit: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.errors = errors.mapped();
    }

    if (res.locals.errors) {
      Products.findByPk(req.params.id, {
        include: [{
          association: 'Images',
        }],
      })
        .then((product) => {
          const images = [];
          for (let i = 0; i < product.dataValues.Images.length; i += 1) {
            images.push(product.dataValues.Images[i].image);
          }

          res.render('products/edit', {
            priorInput: {
              ...req.body,
              id: req.params.id,
              images: Object.hasOwn(res.locals.errors, 'images') ? '' : images,
            },
          });
        })
        .catch((err) => console.error(err));
    }

    const amenities = {};
    for (let i = 0; i < AMENITIES.length; i += 1) {
      if (req.body[AMENITIES[i]] === 'on') {
        Object.defineProperty(amenities, AMENITIES[i], {
          value: true,
          enumerable: true,
        });
      }
    }

    const imgObjArray = [];
    for (let j = 0; j < req.files.length; j += 1) {
      const obj = {};
      Object.defineProperty(obj, 'image', {
        value: req.files[j].filename,
        enumerable: true,
      });
      imgObjArray.push(obj);
    }
    console.log(imgObjArray);

    Products.update({
      max_guests: req.body.max_guests,
      price: req.body.price,
      description: req.body.description,
      province: req.body.province,
      city: req.body.city,
      address: req.body.address,
      type: req.body.type,
      Amenities: amenities,
      Images: imgObjArray,
    }, {
      where: {
        id: req.params.id,
      },
      include: [{
        association: 'Images',
      }, {
        association: 'Amenities',
      }],
    })
      .then(() => res.redirect('/users'))
      .catch((err) => console.error(err));
  },

  delete: (req, res) => {
    const id = req.params.id;
    //funciona con el paranoid, hace borrado logico modificando el valor de deleted_at
    Products.destroy({ where: { id } })
      .then(() => res.redirect('/users'))
      .catch((err) => console.error(err));
  },
};

module.exports = productController;
