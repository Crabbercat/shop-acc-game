const { home_services } = require("../services/index");

/**
 * @returns {display_name, id_account, username, phone_number}
 */
const get_home_page_user_data = async (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) return res.status(200).send();

  try {
    let user_data = await home_services.get_user_data(user_id);

    let data_return = {
      display_name: user_data.display_name,
      id_account: user_data.id_account,
      username: user_data.username,
      phone_number: user_data.phone_number,
      balance: user_data.balance || 0,
    };

    return res.status(200).send(data_return);
  } catch (err) {
    return res.status(500).send();
  }
};

const user_logout = (req, res) => {
  try {
    req.session.destroy();
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  get_home_page_user_data,
  user_logout,
};
