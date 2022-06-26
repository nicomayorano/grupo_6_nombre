/* eslint-disable consistent-return */
/* eslint-disable no-console */

const { validationResult } = require('express-validator');
const { Users } = require('../database/index');
const { Products } = require('../database/index');

const userController = {
  dashboard: async (req, res) => {
    if (req.session.user) {
      const products = await Products.findAll({
        where: {
          user_id: Number(req.session.user.id),
        },
        attributes: ['type', 'city', 'province', 'id'],
        include: [{
          association: 'Images',
          attributes: { exclude: ['product_id', 'updated_at'] },
        }],
      });
      const userProperties = products.map((product) => product.get({ plain: true }));
      res.render('users/dashboard', { userProperties });
    } else {
      return res.redirect('/users/login');
    }
  },

  detail: (req, res) => res.render('users/detail'),

  info: (req, res) => res.render('users/info'),

  traveler: (req, res) => res.render('users/traveler'),

  registerForm: (req, res) => res.render('users/register'),

  loginForm: (req, res) => res.render('users/login'),

  editForm: (req, res) => res.render('users/edit'),

  register: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.locals.errors = errors.mapped();
    }

    if (res.locals.errors) {
      return res.render('users/register', { errors: errors.mapped(), oldData: req.body });
    }

    Users.create({
      ...req.body,
      avatar: req.file?.filename,
    })
      .then(() => res.redirect('/users/login'))
      .catch((error) => console.error(error));
  },

  login: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('users/login', { errors: errors.mapped(), oldData: req.body });
    }

    Users.findOne({
      where: {
        email: String(req.body.email),
      },
      attributes: { exclude: ['password', 'created_at', 'updated_at'] },
    })
      .then((result) => {
        req.session.user = result.get({ plain: true });

        if (req.body.remember_login === 'on') {
          res.cookie('userEmail', req.body.email, { maxAge: 1000 * 60 * 60 });
        }

        return res.redirect('/');
      })
      .catch((error) => console.error(error));
  },

  logout: (req, res) => {
    res.clearCookie('userEmail');
    req.session.destroy(() => {});
    return res.redirect('/');
  },

  edit: (req, res) => {
    // falta logica del guardado de editar el usuario y modificar la vista. y al guardar se podria volver a dirigir al detail de usuario
  },
};

module.exports = userController;