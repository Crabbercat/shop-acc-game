const { auth_services } = require('../services/index');
const user_models = require('../models/user_models');
const { auth_message } = require("../../lang/vi");
const { message_to_client } = require("../helper/message_helper");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const saltRounds = 4;

const { validationResult } = require('express-validator');

const user_register = async (req, res) => {
    let result_valid = validationResult(req).errors;

    if (result_valid.length > 0) return res.status(400).send(result_valid);

    try {
        let username = req.body.username;
        let display_name = req.body.display_name;
        let phone_number = req.body.phone_number;
        let password = req.body.password;

        let result = await auth_services.user_register({ username, display_name, phone_number, password });

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
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : req.body.username;
        const password = req.body.password;

        const user_data = await auth_services.user_login(username, password);

        // Regenerate session to prevent session fixation attacks
        return req.session.regenerate((err) => {
            if (err) return res.status(500).send({ message: 'Could not create session' });

            req.session.user_id = user_data._id;

            const token = jwt.sign({ _id: user_data._id }, JWT_SECRET, { expiresIn: '2h' });

            const data_return = {
                display_name: user_data.display_name,
                id_account: user_data.id_account,
                username: user_data.username,
                phone_number: user_data.phone_number,
                balance: user_data.balance || 0,
                token,
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

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).send(validationErrors.array());
    }

    try {
        const { display_name, username, phone_number, password } = req.body;

        if (!display_name && !username && !phone_number && !password) {
            return res.status(400).send('No fields to update');
        }

        // check uniqueness for username and phone_number
        if (username) {
            const ok = await auth_services.check_username_available(username, current_user_id);
            if (!ok) {
                return res.status(400).send(message_to_client('body', auth_message.username_existed, 'username'));
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

        if (display_name) user.display_name = display_name;
        if (username) user.username = username;
        if (phone_number) user.phone_number = phone_number;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashedPassword;
        }
        user.update_time = Date.now();

        await user.save();

        const data_return = {
            display_name: user.display_name,
            id_account: user.id_account,
            username: user.username,
            phone_number: user.phone_number,
        };

        return res.status(200).send({
            message: auth_message.update_profile_success,
            ...data_return,
        });
    } catch (err) {
        // forward structured errors
        if (Array.isArray(err)) return res.status(400).send(err);
        if (typeof err === 'string') return res.status(400).send(err);
        return res.status(500).send(err);
    }
}

const user_change_password = async (req, res) => {
    const current_user_id = req.session && req.session.user_id;
    if (!current_user_id) return res.status(401).send('Unauthorized');

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).send(validationErrors.array());
    }

    const { current_password, new_password } = req.body;

    try {
        const user = await user_models.find_user_by_id(current_user_id);
        if (!user) return res.status(404).send('User not found');

        const isMatch = await auth_services.verify_user_password(user, current_password);
        if (!isMatch) {
            return res.status(400).send(message_to_client('body', auth_message.current_password_invalid, 'current_password'));
        }

        const hashedPassword = await bcrypt.hash(new_password, saltRounds);
        user.password = hashedPassword;
        user.update_time = Date.now();
        await user.save();

        if (req.session) {
            req.session.user_id = null;
        }

        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) return reject(err);
                resolve();
            });
        }).catch(() => { });

        return res.status(200).send({
            message: auth_message.update_password_success,
            requireReLogin: true,
        });
    } catch (err) {
        if (Array.isArray(err)) return res.status(400).send(err);
        if (typeof err === 'string') return res.status(400).send(err);
        return res.status(500).send(err);
    }
}

module.exports = {
    user_register,
    user_login,
    user_update_profile,
    user_change_password
}