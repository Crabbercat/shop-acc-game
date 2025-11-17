const { auth_services } = require('../services/index');
const user_models = require('../models/user_models');
const { auth_message } = require("../../lang/vi");
const { message_to_client } = require("../helper/message_helper");

const { validationResult } = require('express-validator');

const user_register = async (req, res) => {
    let result_valid = validationResult(req).errors;

    if (result_valid.length > 0) return res.status(400).send(result_valid);

    try {
        let name_account = req.body.name_account;
        let phone_number = req.body.phone_number;
        let password = req.body.password;

        let result = await auth_services.user_register({ name_account, phone_number, password });

        // Created
        return res.status(201).send(result);
    } catch (errors) {
        // If service returned validation-like messages (array), forward as 400
        if (Array.isArray(errors)) {
            return res.status(400).send(errors);
        }

        // If string message, return 400 Bad Request as well
        if (typeof errors === 'string') {
            return res.status(400).send(errors);
        }

        return res.status(500).send(errors);
    }
}

const user_login = async (req, res) => {
    let result_valid = validationResult(req).errors;

    if (result_valid.length > 0) return res.status(400).send(result_valid);

    try {
        const name_account = req.body.name_account;
        const password = req.body.password;

        const user_data = await auth_services.user_login(name_account, password);

        // Regenerate session to prevent session fixation attacks
        return req.session.regenerate((err) => {
            if (err) return res.status(500).send({ message: 'Could not create session' });

            req.session.user_id = user_data._id;

            const data_return = {
                username: user_data.username,
                id_account: user_data.id_account,
                name_account: user_data.name_account,
                phone_number: user_data.phone_number,
            };

            return res.status(200).send(data_return);
        });
    } catch (error) {
        // authentication errors from service use string messages
        if (typeof error === 'string') {
            return res.status(401).send(error);
        }

        return res.status(500).send(error);
    }
}

// exported after defining update function

const user_update_profile = async (req, res) => {
    // must be authenticated
    const current_user_id = req.session && req.session.user_id;
    if (!current_user_id) return res.status(401).send('Unauthorized');

    try {
        const { username, name_account, phone_number } = req.body;

        if (!username && !name_account && !phone_number) {
            return res.status(400).send('No fields to update');
        }

        // check uniqueness for name_account and phone_number
        if (name_account) {
            const ok = await auth_services.check_name_available(name_account, current_user_id);
            if (!ok) {
                return res.status(400).send(message_to_client('body', auth_message.name_account_existed, 'name_account'));
            }
        }

        if (phone_number) {
            const ok = await auth_services.check_phone_available(phone_number, current_user_id);
            if (!ok) {
                return res.status(400).send(message_to_client('body', auth_message.phone_number_existed, 'phone_number'));
            }
        }

        // load user and update
        const user = await user_models.find_user_by_id(current_user_id);
        if (!user) return res.status(404).send('User not found');

        if (username) user.username = username;
        if (name_account) user.name_account = name_account;
        if (phone_number) user.phone_number = phone_number;
        user.update_time = Date.now();

        await user.save();

        const data_return = {
            username: user.username,
            id_account: user.id_account,
            name_account: user.name_account,
            phone_number: user.phone_number,
        };

        return res.status(200).send(data_return);
    } catch (err) {
        // forward structured errors
        if (Array.isArray(err)) return res.status(400).send(err);
        if (typeof err === 'string') return res.status(400).send(err);
        return res.status(500).send(err);
    }
}

module.exports = {
    user_register,
    user_login,
    user_update_profile
}