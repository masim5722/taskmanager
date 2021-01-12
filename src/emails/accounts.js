const sgMail = require('@sendgrid/mail')

const sendgridApiKey = process.env.SEND_GRID_API_KEY

sgMail.setApiKey(sendgridApiKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'masim5722@gmail.com',
        subject: 'Welcome to Task Manager',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

module.exports = {
    sendWelcomeEmail
}