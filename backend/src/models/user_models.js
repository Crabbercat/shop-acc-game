const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let user_schema = new Schema({
  display_name: { type: String, default: "Người dùng" },
  username: { type: String },
  id_account: { type: Number, default: 0 },
  phone_number: { type: String },
  password: String,

  facebook: {
    id: String,
    token: String,
    email: { type: String, trim: true }
  },

  update_time: { type: Number, default: null },
  created_time: { type: Number, default: Date.now() },
  balance: {
    type: Number,
    default: 0
  },
});


user_schema.statics = {
  find_user_by_id(user_id) {
    return this.findOne({ "_id": user_id }).exec();
  },

  find_by_username(username) {
    return this.findOne({ "username": username }).exec();
  },

  create_new(user_data) {
    const payload = {
      "username": user_data.username,
      "phone_number": user_data.phone_number,
      "password": user_data.password,
    };

    if (user_data.display_name) {
      payload.display_name = user_data.display_name;
    }

    return this.create(payload);
  },

  find_by_phone_number(phone_number) {
    return this.findOne({ "phone_number": phone_number }).exec();
  }
}

user_schema.pre("save", function (next) {
  if (this.isNew) {
    user_model.countDocuments().then(res => {
      this.id_account = res + 1000; // Increment count
      next();
    });
  } else {
    next();
  }
})


let user_model = mongoose.model('users', user_schema)

module.exports = user_model;