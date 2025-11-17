const { check } = require('express-validator');
const { auth_message } = require("../../lang/vi");

let register = [
  check("name_account")
    .isLength({ min: 5 }).withMessage(auth_message.na_acc_too_short)
    .isLength({ max: 50 }).withMessage(auth_message.na_acc_too_long)
    .matches(/^[a-zA-Z0-9]+$/i).withMessage(auth_message.na_acc_type),

  check("phone_number")
    .isLength({ min: 10, max: 10 }).withMessage(auth_message.phone_number_invalid)
    .matches(/((09|03|07|08|05)+([0-9]{8})\b)/i).withMessage(auth_message.phone_number_invalid),

  check("password")
    // Password policy: at least 8 chars, must include an uppercase letter, a digit and a special character
    .isLength({ min: 8, max: 50 }).withMessage(auth_message.password_length)
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/).withMessage(auth_message.password_policy)
]

let login = [
  check("name_account")
    .isLength({ min: 5 }).withMessage(auth_message.na_acc_too_short)
    .isLength({ max: 50 }).withMessage(auth_message.na_acc_too_long)
    .matches(/^[a-zA-Z0-9]+$/i).withMessage(auth_message.na_acc_type),
  check("password")
    // Make login password validation consistent with registration policy:
    // require at least 8 characters and enforce the same password policy
    .isLength({ min: 8, max: 50 }).withMessage(auth_message.password_length)
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/).withMessage(auth_message.password_policy)
]

module.exports = {
  register,
  login
}