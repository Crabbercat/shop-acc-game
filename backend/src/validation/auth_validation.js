const { check } = require('express-validator');
const { auth_message } = require("../../lang/vi");

let register = [
  check("username")
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
  check("username"),
  check("password")
]

let update_profile = [
  check("username")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 5 }).withMessage(auth_message.na_acc_too_short)
    .isLength({ max: 50 }).withMessage(auth_message.na_acc_too_long)
    .matches(/^[a-zA-Z0-9]+$/i).withMessage(auth_message.na_acc_type),

  check("phone_number")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 10, max: 10 }).withMessage(auth_message.phone_number_invalid)
    .matches(/((09|03|07|08|05)+([0-9]{8})\b)/i).withMessage(auth_message.phone_number_invalid),

  check("password")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 8, max: 50 }).withMessage(auth_message.password_length)
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/).withMessage(auth_message.password_policy)
]

let change_password = [
  check("current_password")
    .exists({ checkFalsy: true }).withMessage(auth_message.current_password_required),

  check("new_password")
    .isLength({ min: 8, max: 50 }).withMessage(auth_message.password_length)
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/).withMessage(auth_message.password_policy),

  check("confirm_password")
    .exists({ checkFalsy: true }).withMessage(auth_message.confirm_password_required)
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage(auth_message.confirm_password_mismatch),
]

module.exports = {
  register,
  login,
  update_profile,
  change_password
}