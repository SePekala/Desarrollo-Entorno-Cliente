var mongoose=require('mongoose');

var cuentaSchema=mongoose.Schema(
    {
        login:{ type:String, required: [true ,'* Login requerido']},
        email:{ type:String, required: [true ,'* Email requerido'] , match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ },
        password:{ type:String, 
                   required: [true ,'* Password obligatoria'] ,
                   match:[/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{4,50})/,
                         '* En la password al menos una MAYS, MIN, NUM y caracter raro' ]},
        imagenAvatar:{ type: String, default:'' },
        cuentaActiva:{ type:Boolean, default: false }
    }
);

module.exports=mongoose.model('Cuenta', cuentaSchema, 'cuentas');