//modulo de codigo para crearnos el esquema mongoose CLIENTES, el esquema sirve para mapear
//un doc. de la collecion "clientes" de la BD de mongo AgapeaDB contra un objeto "Cliente" definido en el esquema
//ademas sirve tb para definir parametros de validacion en props., metodos estaticos, metodos del prototipo, ...

var mongoose=require('mongoose');

var clienteSchema=new mongoose.Schema(
    {
        nombre: { type:String, required: [true,'* Nombre obligatorio'], default:'' },
        apellidos: { type: String, required: [true,'* Apellidos obligatorios'], default: ''},
        fechaNacimiento: { type: Date, default: new Date() },
        genero: { type: String, default: '' },
        telefono: { type: String, 
                    required: [true, '*Telefono obligatorio'],
                    match:[/^\d{3}(\s\d{2}){3}$/, 'El telefono tiene que ser formato 666 11 22 33'  ]},
        descripcion: { type: String, default: ''},
        nif: { type: String, match:[/^[0-9]{8}-?[a-zA-Z]$/, '*El NIF tiene que tener formato 12345678-A o sin guion'], default:'00000000A' },
        cuenta: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta'},
        direcciones:[ 
                        { type: mongoose.Schema.Types.ObjectId, ref: 'Direccion'}
                      ],
        pedidos:[ 
                    { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido'}
                 ],
        pedidoActual: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }
        
    }
);

module.exports=mongoose.model('Cliente',clienteSchema,'clientes');
//1º argumento nombre de los objetos q se van a crear a partir del esquema
//2º argumento el esquema q se utiliza como prototipo para crearlos
//3º argumento nombre de la coleccion en la BD mongoDB en la q mapeas un objeto con un documento