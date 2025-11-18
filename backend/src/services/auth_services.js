const user_models = require('../models/user_models');
const { auth_message } = require("../../lang/vi");
const { message_to_client } = require("../helper/message_helper");

const bcrypt = require('bcrypt');

const saltRounds = 4;


const user_register = async (user_data) => {
  // returns a promise that resolves with a success message or rejects with a formatted error
  const check_username = await user_models.find_by_username(user_data.username);
  const check_phone_number = await user_models.find_by_phone_number(user_data.phone_number);

  if (check_username) {
    throw message_to_client("body", auth_message.username_existed, "username");
  }
  if (check_phone_number) {
    throw message_to_client("body", auth_message.phone_number_existed, "phone_number");
  }

  // Hash password and create user atomically
  try {
    const hash = await bcrypt.hash(user_data.password, saltRounds);
    user_data.password = hash;

    await user_models.create_new(user_data);

    return auth_message.create_success;
  } catch (err) {
    // bubble up as an error
    throw err;
  }
};

const user_login = async (username, password) => {
  const user_data = await user_models.find_by_username(username);
  if (!user_data) throw auth_message.login_invalid;

  const match = await bcrypt.compare(password, user_data.password);
  if (!match) throw auth_message.login_invalid;

  return user_data;
};

// Check availability of a username for update (allow if owned by current user)
const check_username_available = async (username, current_user_id) => {
  const user = await user_models.find_by_username(username);
  if (!user) return true;
  // allow if the found user is the current user
  if (current_user_id && user._id && user._id.toString() === current_user_id.toString()) return true;
  return false;
};

// Check availability of a phone number for update (allow if owned by current user)
const check_phone_available = async (phone_number, current_user_id) => {
  const user = await user_models.find_by_phone_number(phone_number);
  if (!user) return true;
  if (current_user_id && user._id && user._id.toString() === current_user_id.toString()) return true;
  return false;
};

module.exports = {
  user_register,
  user_login,
  check_username_available,
  check_phone_available
}