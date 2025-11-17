const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RechargeHistorySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    telco: {
        type: String,
        required: true
    },
    serial: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    realAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'error'],
        default: 'pending'
    },
    request_id: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('recharge_history', RechargeHistorySchema);