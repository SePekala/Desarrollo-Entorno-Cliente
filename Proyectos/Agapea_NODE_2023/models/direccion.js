var mongoose=require('mongoose');

var direccionSchema=new mongoose.Schema(
    {
        calle: {type:String ,required:[true, '* calle requerida']},
        pais: {type:String ,default:'España'},
        cp: {type:Number ,required:[true, '* cp requerido'], match:[ /^[0-9]{5}$/, '* formato invalido: 1235']},
        provincia:{
            CPRO: {type: String, required: true},
            PRO: {type: String, required: true},
            CCOM: {type: String, default:''}
        },
        municipio:{
            CPRO: {type: String, required: true},
            CMUM: {type: String, required: true},
            DMUN50: {type: String, required: true},
            CUN: {type: String, default:''}
        },
        esPrincipal: {type:Boolean ,default:false},
        esFacturacion: {type:Boolean ,default:false}

    }
)

module.exports=mongoose.model('Direccion',direccionSchema,'direcciones')