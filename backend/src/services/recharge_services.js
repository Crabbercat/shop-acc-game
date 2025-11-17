const RechargeHistory = require('../models/recharge_history_model');
const User = require('../models/user_models');
const cards = require('../../data/cards.json');
const { v4: uuidv4 } = require('uuid');

const rechargeService = {
    recharge: async (userId, data) => {
        const { telco, serial, code, amount } = data;

        const existingUsedCard = await RechargeHistory.findOne({
            serial,
            code,
            status: { $in: ['success', 'failed', 'error', 'pending'] }
        });

        if (existingUsedCard) {
            return {
                status: 400,
                message: 'Thẻ sai hoặc đã dùng trước đó, vui lòng không thử lại'
            };
        }

        const card = cards.find(c => c.serial === serial && c.code === code && c.telco === telco && c.amount === amount);
        const request_id = uuidv4();

        const newRecharge = await RechargeHistory.create({
            user: userId,
            telco,
            serial,
            code,
            amount,
            realAmount: 0,
            status: 'pending',
            request_id
        });
        const delay = Math.floor(Math.random() * 9000) + 1000; // 1-10s

        setTimeout(async () => {
            try {
                const finalStatus = card && card.status === 'available' ? 'success' : 'failed';
                const realAmount = finalStatus === 'success' ? amount : 0;

                if (finalStatus === 'success') {
                    card.status = 'used';
                    await User.findByIdAndUpdate(userId, { $inc: { balance: realAmount } });
                }

                await RechargeHistory.findByIdAndUpdate(newRecharge._id, {
                    status: finalStatus,
                    realAmount
                });
            } catch (err) {
                console.error('Finalize recharge error', err);
                await RechargeHistory.findByIdAndUpdate(newRecharge._id, {
                    status: 'error'
                });
            }
        }, delay);

        return {
            status: 200,
            message: 'Thẻ đang được xử lý, vui lòng chờ trong giây lát.',
            data: newRecharge
        };
    },
    getHistory: async (userId) => {
        const history = await RechargeHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'username name_account');
        return {
            status: 200,
            data: history
        };
    }
};

module.exports = rechargeService;