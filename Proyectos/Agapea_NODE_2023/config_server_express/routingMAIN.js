//modulo raiz de node  donde configuramos el enrutamiento
//va a exportar una funcion q recibe como parametro el servidor express en el q quiero configurar el enrutamiento

var routingCliente=require('./routingCliente');

module.exports=function(servidorExpress){

    servidorExpress.use('/Cliente', routingCliente);

}