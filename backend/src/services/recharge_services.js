const RechargeHistory = require('../models/recharge_history_model');
const User = require('../models/user_models');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const PENDING_MESSAGE = 'Thẻ đang được nạp, vui lòng chờ trong giây lát.';
const ERROR_MESSAGE = 'Có lỗi khi xử lý thẻ, vui lòng liên hệ hỗ trợ.';
const cardsFilePath = path.join(__dirname, '..', '..', 'data', 'cards.json');

const readCards = async () => {
  const content = await fs.readFile(cardsFilePath, 'utf8');
  return JSON.parse(content);
};

const writeCards = async (cards) => {
  await fs.writeFile(cardsFilePath, JSON.stringify(cards, null, 2), 'utf8');
};

const updateCardStatus = async (serial, code, status) => {
  const cards = await readCards();
  const index = cards.findIndex(
    (card) => String(card.serial) === serial && String(card.code) === code
  );
  if (index === -1) return false;
  cards[index].status = status;
  await writeCards(cards);
  return true;
};

const determineOutcome = ({
  cardSnapshot,
  numericAmount,
  existingActiveHistory,
  userId,
  normalizedSerial,
  normalizedCode,
  normalizedTelco,
}) => {
  const cardAmount = cardSnapshot && Number.isFinite(Number(cardSnapshot.amount))
    ? Number(cardSnapshot.amount)
    : null;

  if (!cardSnapshot) {
    return {
      type: 'not_found',
      finalStatus: 'failed',
      message: 'Thẻ lỗi, vui lòng kiểm tra lại seri hoặc mã thẻ.',
      creditAmount: 0,
      cardAmount: null,
    };
  }

  const cardStatusRaw = cardSnapshot && cardSnapshot.status ? String(cardSnapshot.status).trim().toLowerCase() : '';
  const isCardAvailable = !cardStatusRaw || cardStatusRaw === 'available';

  if (!isCardAvailable) {
    return {
      type: 'already_used',
      finalStatus: 'failed',
      message: 'Thẻ đã được sử dụng, vui lòng dùng thẻ khác.',
      creditAmount: 0,
      cardAmount,
      cardStatusAfter: cardStatusRaw,
    };
  }

  const historyBelongsToUser =
    existingActiveHistory &&
    existingActiveHistory.status === 'success' &&
    existingActiveHistory.user &&
    userId &&
    String(existingActiveHistory.user) === String(userId);

  if (historyBelongsToUser) {
    return {
      type: 'already_used',
      finalStatus: 'failed',
      message: 'Thẻ đã được sử dụng, vui lòng dùng thẻ khác.',
      creditAmount: 0,
      cardAmount,
      cardStatusAfter: cardStatusRaw,
    };
  }

  if (
    existingActiveHistory &&
    existingActiveHistory.status === 'success' &&
    (!existingActiveHistory.user || String(existingActiveHistory.user) !== String(userId))
  ) {
    console.warn(
      'Phát hiện thẻ đã có lịch sử nạp thành công bởi người dùng khác, nhưng trạng thái thẻ hiện là available.',
      {
        serial: normalizedSerial,
        code: normalizedCode,
        telco: normalizedTelco,
        previousUser: existingActiveHistory.user,
      }
    );
  }

  if (!Number.isFinite(cardAmount)) {
    return {
      type: 'not_found',
      finalStatus: 'failed',
      message: 'Thẻ lỗi, vui lòng kiểm tra lại seri hoặc mã thẻ.',
      creditAmount: 0,
      cardAmount: null,
    };
  }

  if (cardAmount !== numericAmount) {
    const penaltyCredit = Math.floor(cardAmount * 0.5);
    return {
      type: 'wrong_amount',
      finalStatus: 'success',
      message: 'Sai mệnh giá, chỉ nhận 50% mệnh giá thực tế của thẻ.',
      creditAmount: penaltyCredit,
      cardAmount,
      cardStatusAfter: 'used',
    };
  }

  return {
    type: 'success',
    finalStatus: 'success',
    message: 'Nạp thẻ thành công.',
    creditAmount: cardAmount,
    cardAmount,
    cardStatusAfter: 'used',
  };
};

const finalizeRecharge = async ({
  outcome,
  newRechargeId,
  userId,
  normalizedSerial,
  normalizedCode,
  cardSnapshot,
}) => {
  let balanceIncremented = false;
  try {
    const creditedAmount = outcome.creditAmount || 0;

    if (outcome.type === 'success') {
      if (creditedAmount > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { balance: creditedAmount } });
        balanceIncremented = true;
      }

      await RechargeHistory.findByIdAndUpdate(newRechargeId, {
        status: 'success',
        realAmount: creditedAmount,
        message: outcome.message,
      });

      if (cardSnapshot) {
        const updated = await updateCardStatus(
          normalizedSerial,
          normalizedCode,
          outcome.cardStatusAfter || 'used'
        );
        if (!updated) throw new Error('Không thể cập nhật trạng thái thẻ sang used');
      }
      return;
    }

    if (outcome.type === 'wrong_amount') {
      if (creditedAmount > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { balance: creditedAmount } });
        balanceIncremented = true;
      }

      await RechargeHistory.findByIdAndUpdate(newRechargeId, {
        status: 'failed',
        realAmount: creditedAmount,
        message: outcome.message,
      });

      if (cardSnapshot) {
        const updated = await updateCardStatus(
          normalizedSerial,
          normalizedCode,
          outcome.cardStatusAfter || 'used'
        );
        if (!updated) throw new Error('Không thể cập nhật trạng thái thẻ sang used');
      }
      return;
    }

    await RechargeHistory.findByIdAndUpdate(newRechargeId, {
      status: 'failed',
      realAmount: 0,
      message: outcome.message,
    });
  } catch (error) {
    console.error('Finalize recharge error', error);
    const creditedAmount = outcome.creditAmount || 0;

    if (balanceIncremented && creditedAmount > 0) {
      await User.findByIdAndUpdate(userId, { $inc: { balance: -creditedAmount } }).catch(
        (rollbackBalanceErr) =>
          console.error('Không thể hoàn tác số dư người dùng', rollbackBalanceErr)
      );
    }

    if (cardSnapshot) {
      const revertStatus = cardSnapshot.status || 'available';
      await updateCardStatus(normalizedSerial, normalizedCode, revertStatus).catch((rollbackErr) =>
        console.error('Không thể hoàn tác trạng thái thẻ', rollbackErr)
      );
    }

    await RechargeHistory.findByIdAndUpdate(newRechargeId, {
      status: 'error',
      realAmount: 0,
      message: ERROR_MESSAGE,
    }).catch((historyErr) =>
      console.error('Không thể cập nhật trạng thái lỗi cho lịch sử nạp', historyErr)
    );
  }
};

const getStatusByRequestId = async (userId, requestId) => {
  if (!requestId) {
    return {
      status: 400,
      message: 'Thiếu thông tin request.',
    };
  }

  const record = await RechargeHistory.findOne({
    user: userId,
    request_id: requestId,
  });

  if (!record) {
    return {
      status: 404,
      message: 'Không tìm thấy giao dịch nạp thẻ.',
    };
  }

  return {
    status: 200,
    data: {
      request_id: record.request_id,
      status: record.status,
      message: record.message,
      amount: record.amount,
      cardAmount: record.cardAmount,
      realAmount: record.realAmount,
      updatedAt: record.updatedAt,
    },
  };
};

const rechargeService = {
  recharge: async (userId, data) => {
    const { telco, serial, code, amount } = data;

    const normalizedTelco = typeof telco === 'string' ? telco.trim().toUpperCase() : '';
    const normalizedSerial =
      serial !== undefined && serial !== null ? String(serial).trim() : '';
    const normalizedCode = code !== undefined && code !== null ? String(code).trim() : '';
    const numericAmount = Number(amount);

    if (
      !normalizedTelco ||
      !normalizedSerial ||
      !normalizedCode ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return {
        status: 400,
        message: 'Thông tin thẻ không hợp lệ.',
      };
    }

    let cards;
    try {
      cards = await readCards();
    } catch (error) {
      console.error('Không đọc được danh sách thẻ', error);
      return {
        status: 500,
        message: 'Hệ thống đang bận, vui lòng thử lại sau.',
      };
    }

    const cardIndex = cards.findIndex(
      (card) =>
        String(card.serial) === normalizedSerial &&
        String(card.code) === normalizedCode &&
        String((card.telco || '').toUpperCase()) === normalizedTelco
    );

    const cardSnapshot = cardIndex > -1 ? { ...cards[cardIndex] } : null;

    let existingActiveHistory = null;
    try {
      existingActiveHistory = await RechargeHistory.findOne({
        serial: normalizedSerial,
        code: normalizedCode,
        telco: normalizedTelco,
        status: { $in: ['pending', 'success'] },
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Không thể kiểm tra lịch sử thẻ hiện tại', error);
    }

    if (existingActiveHistory && existingActiveHistory.status === 'pending') {
      const isSameUser =
        existingActiveHistory.user &&
        String(existingActiveHistory.user) === String(userId);

      return {
        status: 200,
        message: PENDING_MESSAGE,
        data: isSameUser ? existingActiveHistory : {
          request_id: existingActiveHistory.request_id,
          status: existingActiveHistory.status,
          message: PENDING_MESSAGE,
        },
      };
    }

    const outcome = determineOutcome({
      cardSnapshot,
      numericAmount,
      existingActiveHistory,
      userId,
      normalizedSerial,
      normalizedCode,
      normalizedTelco,
    });

    const request_id = uuidv4();

    let newRecharge;
    try {
      newRecharge = await RechargeHistory.create({
        user: userId,
        telco: normalizedTelco,
        serial: normalizedSerial,
        code: normalizedCode,
        amount: numericAmount,
        cardAmount: outcome.cardAmount,
        realAmount: 0,
        status: 'pending',
        request_id,
        message: PENDING_MESSAGE,
      });
    } catch (error) {
      console.error('Không thể tạo lịch sử nạp thẻ', error);
      throw error;
    }

    const delay = Math.floor(Math.random() * 9000) + 1000;

    setTimeout(async () => {
      await finalizeRecharge({
        outcome,
        newRechargeId: newRecharge._id,
        userId,
        normalizedSerial,
        normalizedCode,
        cardSnapshot,
      });
    }, delay);

    return {
      status: 200,
      message: PENDING_MESSAGE,
      data: newRecharge,
    };
  },
  getHistory: async (userId) => {
    const history = await RechargeHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'display_name username');
    return {
      status: 200,
      data: history
    };
  },
  getStatusByRequestId,
};

module.exports = rechargeService;