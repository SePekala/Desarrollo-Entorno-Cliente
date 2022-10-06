var mongoose=require('mongoose');

var cuentaSchema=mongoose.Schema(
    {
        login: {},
        ElementInternalspassword: {},
        imagenAvatar: {},
        cuentaActiva: {}
    }
);

module.exports=mongoose.model('Cuenta',cuentaSchema,'cuentas');