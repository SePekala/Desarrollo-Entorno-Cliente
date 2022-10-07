const Mailjet = require('node-mailjet');
module.exports = function (emailCliente,subject,cuerpoMail) {
    const mailjet = Mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
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
                    "Name": "prueba envio"
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
