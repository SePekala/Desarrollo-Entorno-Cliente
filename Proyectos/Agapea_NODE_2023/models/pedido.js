var mongoose=require('mongoose');
var Direccion=require('./direccion');
var Libro=require('./libro');

var pedidoSchema=mongoose.Schema(
    {
        fechaPedido: {type: Date, default: new Date() },
        estadoPedido: {type: String, default: 'generando'},
        elementosPedido:[
            {
                LibroElemento: { type: mongoose.Schema.Types.ObjectId, ref:'Libro' },
                cantidadElemento:{ type: Number, required: true, default: 1}
            }
        ],
        subTotalEnvio:{type: Decimal, default: 0},
        gastosEnvio:{type: Decimal, default: 0},
        totalPedido:{type: Decimal, default: 0},
        direccionEnvio:{type: mongoose.Schema.Types.ObjectId, ref_: 'Direccion'},
        direccionFacturacion:{type: mongoose.Schema.Types.ObjectId, ref_: 'Direccion'}
    }
);

//metodos del esquema para calcular total y subtotal...
pedidoSchema.methods.CalculaTotalPedido=async function() {

    //tengo q expandir dentro del elementoPedido los _id de los libros a un obj del modelo Libro...
    //como se hace dentro de los objeto MODELO  q se crea el esquema la sintaxis es esta:

    // await nombre_modelo_que_quieres_expandir . populate( variable_datos_expandir, { path: 'propiedad_del_modelo' })
    var _elementosExpandidos=await Libro.populate(this.elementosPedido, {path: 'libroElemento'} );

    var _subtotal=0;
    this.elementosPedido.forEach(elementoPed => {
        _subtotal +=  elementoPed.LibroElemento.precio * elementoPed.cantidadElemento;
    });

    this.subTotalEnvio=_subtotal; //<--- OJO!!  q te lo muestra redondeado!!! hay q solucionarlo...
    this.gastosEnvio=2.00; //<--- en funcion de la direccion de envio, la provincia, esto cambiara...
    
    this.totalPedido=this.subTotalEnvio + this.gastosEnvio;
}

module.exports=mongoose.model('Pedido',pedidoSchema,'pedidos')