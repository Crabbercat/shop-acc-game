const Joi = require('joi');

const rechargeValidation = {
    recharge: (data) => {
        const schema = Joi.object({
            telco: Joi.string().required(),
            serial: Joi.string().required(),
            code: Joi.string().required(),
            amount: Joi.number().required()
        });
        return schema.validate(data);
    }
};

module.exports = rechargeValidation;