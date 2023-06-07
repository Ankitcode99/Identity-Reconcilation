const express = require('express');
const router = express.Router();
const { consolidateContact } = require('../controller/userController')

router.post('/', consolidateContact)

module.exports = router