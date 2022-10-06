var mongoose=require('mongoose');

var cuentaSchema=mongoose.Schema(
    {
        login:{ type:String, required: true },
        email:{ type:String, match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, required: true },
        password:{ type:String, match:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{4,50})/ , required: true },
        imagenAvatar:{ type: String, default:'' },
        cuentaActiva:{ type:Boolean, default: false }
    }
);

module.exports=mongoose.model('Cuenta', cuentaSchema, 'cuentas');