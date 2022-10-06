//modulo principal de node donde configuramos el enrutamiento
//va a exportar una funcion q recibe como parametro el servidor express en el q quiero configurar en enrutamiento

var routingCliente=require('./routingCliente');

module.exports=function(servidorExpress){
    servidorExpress.use('/Cliente', routingCliente);
}