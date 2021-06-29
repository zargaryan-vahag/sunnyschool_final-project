const express = require('express');

const router = express.Router();
const isLoggedIn = require('../middlewares/token-validator');
const DialogController = require('../controllers/dialog-controller');

router.get('/',
  isLoggedIn(),
  DialogController.getDialogs
);

module.exports = router;
