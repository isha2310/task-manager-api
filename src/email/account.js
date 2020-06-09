const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email , name) => {
    sgMail.send({
        to: email , 
        from: 'isha23.ag@gmail.com' ,
        subject: 'Welcome to the App' ,
        text: `Hello ${name} ! \n\nThanks for joining in. Let's get started with managing your tasks!`
    }).then(() => {} , error => {
        console.error(error)
        if(error.response){
            console.error(error.response.body)
        }
    })  
}

const sendCancellationMail = (email , name) => {
    sgMail.send({
        to: email , 
        from: 'isha23.ag@gmail.com' ,
        subject: 'Sorry to see you go!' ,
        text: `Hello ${name} ! \n\nWhat went wrong?\nWould you like to make any suggestion?`
    }).then(() => {} , error => {
        console.error(error)
        if(error.response){
            console.error(error.response.body)
        }
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancellationMail
}