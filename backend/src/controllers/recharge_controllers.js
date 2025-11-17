const rechargeService = require('../services/recharge_services');
const rechargeValidation = require('../validation/recharge_validation');

const rechargeController = {
  recharge: async (req, res) => {
    try {
      const { error } = rechargeValidation.recharge(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message
        });
      }
      const result = await rechargeService.recharge(req.user._id, req.body);
      if (result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }
      return res.status(result.status).json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  },
  getHistory: async (req, res) => {
    try {
      const result = await rechargeService.getHistory(req.user._id);
      return res.status(result.status).json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  },
  getStatus: async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const result = await rechargeService.getStatusByRequestId(req.user._id, requestId);
      return res.status(result.status).json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  }
};

module.exports = rechargeController;