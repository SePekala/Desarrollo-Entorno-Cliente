//modulo raiz de node  donde configuramos el enrutamiento
//va a exportar una funcion q recibe como parametro el servidor express en el q quiero configurar el enrutamiento

var routingCliente=require('./routingCliente');
var routingTienda=require('./routingTienda');
// var routingPedido=require('./routingPedido');

var routingRest=require('./routingREST');

module.exports=function(servidorExpress){

    servidorExpress.use('/Cliente', routingCliente);
    servidorExpress.use('/Tienda', routingTienda);
    // servidorExpress.use('/Pedido', routingPedido);

    servidorExpress.use('/api', routingRest);

}