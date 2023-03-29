const { register, login, logout } = require('../controllers/authController');
const express = require('express');
const router = express.Router();
// post('/register') post('/login') get('/logout')

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
