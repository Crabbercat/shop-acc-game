const express = require('express');
const router = express.Router();
const rechargeController = require('../controllers/recharge_controllers');
const { verifyToken } = require('../helper/auth_middleware');

router.post('/recharge', verifyToken, rechargeController.recharge);
router.get('/recharge/history', verifyToken, rechargeController.getHistory);
router.get('/recharge/status/:requestId', verifyToken, rechargeController.getStatus);

module.exports = router;