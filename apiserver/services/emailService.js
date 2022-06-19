const axios = require("axios");


module.exports = class Email {
    constructor(user, data, fromOption = `${process.env.SENDGRID_EMAIL_FROM}`) {
        this.request = {
            "from": {
                "email": `durmusdemirtas.com <${fromOption}>`
            },
            "reply_to": {
                "email": `${process.env.SENDGRID_EMAIL_REPLY_TO}`
            },
            "personalizations": [
                {
                    "to": [{ "email": user.email }],
                    "dynamic_template_data": { name: user.firstName.toUpperCase(), ...data }
                }
            ]
        }
    }

    // Send the actual email
    async send(templateId) {
        this.request.template_id = templateId;
        return await axios.post("https://api.sendgrid.com/v3/mail/send", this.request,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
                }
            })
    };

    async sendEmailVerification() {
        await this.send(process.env.SENDGRID_VERIFICATION_TEMPLATE_ID);
    };
};
