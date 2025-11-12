const { auth_services } = require('../services/index');

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

module.exports = {
    user_register,
    user_login
}