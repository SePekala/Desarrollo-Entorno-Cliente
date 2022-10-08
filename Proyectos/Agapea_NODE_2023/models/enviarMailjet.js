const Mailjet = require('node-mailjet');
module.exports = function (emailCliente,nombre,subject,cuerpoMail) {
    const mailjet = Mailjet.apiConnect(process.env.API_KEY_MAILJET, process.env.SECRET_KEY_MAILJET);
    const request = mailjet
        .post("send", {
            'version': 'v3.1'
        })
        .request({
            "Messages": [{
                "From": {
                    "Email": "sergiopekala.est@gmail.com",
                    "Name": "Admin Agapea"
                },
                "To": [{
                    "Email": emailCliente,
                    "Name": nombre
                }],
                "Subject": subject,
                "HTMLPart": cuerpoMail
            }]
        });
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        });
}

//module.exports.MandarMailJet = MandarMailJet; 
