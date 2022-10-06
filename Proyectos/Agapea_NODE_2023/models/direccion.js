var mongoose=require('mongoose');
const clienteController = require('../controllers/clienteController');

var direccionSchema=mongoose.Schema(
    {
        /*
        public String IdDireccion { get; set; }
        public String Calle { get; set; }
        public String Numero { get; set; }
        public String Edificio { get; set; }
        public String piso { get; set; }
        public String Letra { get; set; }
        public int CP { get; set; }
        public Muncipio LocalidadDirecc { get; set; }
        public Provincia ProvinciaDirecc { get; set; }
        public String Pais { get; set; } = "España";
        */

        calle: {type:String ,default:''},
        numero: {type:Number ,default:''},
        edificio: {type:String ,default:''},
        piso: {type:String ,default:''},
        letra: {type:String ,default:''},
        codigoPostal: {type:Number ,default:''},
        municipio:[
            { type: mongoose.Schema.Types.ObjectId, ref: 'Munipio' }
        ],
        provincias:[
            { type: moongose.Schema.Types.ObjectId, ref: 'Provincia' }
        ],

        pais: {type:String ,default:''}

    }
)

module.exports=mongoose.model('Cliente',direccionSchema,'direcciones')