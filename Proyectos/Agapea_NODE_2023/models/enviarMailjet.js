const Mailjet = require('node-mailjet');
function MandarMailJet(emailCliente) {
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
                "Subject": "Your email flight plan!",
                "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
                "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
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

module.exports.MandarMailJet = MandarMailJet; 
