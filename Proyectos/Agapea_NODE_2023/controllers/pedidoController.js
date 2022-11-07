var Libro=require('../models/libro');
var Pedido=require('../models/pedido');

function renderizarMostrarPedido(clientesesion,req,res) {

    //actualizar el subtotal y total del pedido
    var _subtotal=0;

    clientesesion.pedidoActual.elementosPedido.forEach(element => 
        {
            _subtotal += element.libroElemento.Precio * element.cantidadElemento;
        }
    );

    clientesesion.pedidoActual.subTotalPedido=_subtotal;
    clientesesion.pedidoActual.totalPedido=_subtotal + clientesesion.pedidoActual.gastosEnvio;

    //actualizar variable de session del cliente con pedido modificado
    req.session.datoscliente = clientesesion;

    //renderizar vista mostrar pedido.hbs
    res.status(200).render('Pedido/MostrarPedido.hbs', { layout: null , cliente: clientesesion });

}

module.exports={
    addLibroPedido: async (req,res,next) => {
        try {
            var _isbn13=req.params.isbn13;
            var _cliente=req.session.datoscliente;
    
            //compruebo antes de añadir el libro a los items del carro si ya existe... si existe incremento su cantidad
            var _posicionLibro=_cliente.pedidoActual.elementosPedido.findIndex( itemped => itemped.libroElemento.ISBN13==_isbn13);
    
            if(_posicionLibro == -1)
            {
                var _libro = await Libro.findOne({ISBN13: _isbn13}).lean();
                _cliente.pedidoActual.elementosPedido.push( { libroElemento: _libro, cantidadElemento: 1} );
            }
            else
            {
                //existe el libro ya, incrementamos cantidad en 1 unidad...
                _cliente.pedidoActual.elementosPedido[_posicionLibro].cantidadElemento += 1;
            }
            
            renderizarMostrarPedido(_cliente,req,res);
            
        } catch (error) {
            console.log('error al añadir nuevo libro al pedido...',error);
        }
    },
    sumarCantidadLibro: async (req,res,next) => {
        try {
            var _isbn13=req.params.isbn13;
            var _cliente=req.session.datoscliente;

            _cliente.pedidoActual.elementosPedido.forEach( (elem,index) => 
                {        
                    if(elem.libroElemento.ISBN13==_isbn13)
                    {
                        elem.cantidadElemento += 1;
                    }
                }
            );

            renderizarMostrarPedido(_cliente,req,res);

        } catch (error) {
            console.log('error al sumar nuevo libro al pedido...',error);
        }
    },
    restarCantidadLibro: async (req,res,next) => {
        try {
            var _isbn13=req.params.isbn13;
            var _cliente=req.session.datoscliente;

            _cliente.pedidoActual.elementosPedido.forEach( (elem,index) => 
                {        
                    if(elem.libroElemento.ISBN13==_isbn13)
                    {
                        if(elem.cantidadElemento > 1){
                            _cliente.pedidoActual.elementosPedido[index].cantidadElemento -= 1;
                        }
                    }
                }
            );

            renderizarMostrarPedido(_cliente,req,res);

        } catch (error) {
            console.log('error al restar libro al pedido...',error);
        }
    },
    eliminarLibroPedido: async (req,res,next) =>{
        try {
            var _isbn13=req.params.isbn13;
            var _cliente=req.session.datoscliente;

            _cliente.pedidoActual.elementosPedido=_cliente.pedidoActual.elementosPedido.filter(elem => elem.libroElemento.ISBN13!=_isbn13);
            renderizarMostrarPedido(_cliente,req,res);

        } catch (error) {
            console.log('error al intentar eliminar libro del pedido actual',error);
        }
       
    }
}