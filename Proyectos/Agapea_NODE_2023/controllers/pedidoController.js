var axios=require("axios");
var mongoose=require('mongoose');

//------------------ pago con tarjeta usando stripe ------------
var stripe=require('stripe')(process.env.SECRETKEY_STRIPE_ID)

//------------------ pago con paypal ------------
var paypal=require('paypal-rest-sdk');
paypal.configure( 
    {
        'mode': 'sandbox',
        'cliente_id': process.env.PAYPAL_CLIENTEID,
        'client_secret': process.env.PAYPAL_CLIENTESECRET
    }
);

//------------------ generacion facturas pdf ------------
var PDFDocument=require('pdfkit-table');
var fs=require('fs');

//------------------ modelo de datos en mongo ------------

var Direccion = require('../models/direccion');
var Libro=require('../models/libro');
var Pedido=require('../models/pedido');
var Cliente=require('../models/cliente');
const cliente = require("../models/cliente");

async function renderizarMostrarPedido(clientesesion,req,res) {

    //actualizar el subtotal y total del pedido
    var _respRest= await axios.get('https://apiv1.geoapi.es/provincias?type=JSON&key=&sandbox=1');

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
    res.status(200).render('Pedido/MostrarPedido.hbs', { 
        layout: null , 
        cliente: clientesesion ,
        meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        anios: Array.from(
            { length: 5 },
            (el, pos) => pos + new Date(Date.now()).getFullYear()
        ),
        direccionprincipal: clientesesion.direcciones.filter( (item) => item.esPrincipal==true)[0],
        provincias: _respRest.data.data
    
    });
}

async function finalizarPedidoOK(nuevadireccion,datosfacturacion,clientesession,req,res){

    //almaceno en mongodb la nueva direccion q ha creado en el envio...
    //siempre y cuando en nuevadireccion haya datos, no este el objeto vacio pq entonces
    //significa que la direccion de envio es la direccion principal del cliente...

    if( ! Object.keys(nuevadireccion).length == 0 ) {
        //hacer transaccion para dos querys, el insert en direcciones y el update en clientes...
        try {
            var _session = await mongoose.connection.startSession();
            _session.startTransaction();

            var _newdirecc = await new Direccion(nuevadireccion).save( {session: _session} );

            var _updatecliente = await Cliente.findByIdAndUpdate(
                                                            {_id: clientesession._id},
                                                            {$push: {direcciones: _newdirecc.id} })
                                                .session(_session);
            _session.commitTransaction();
        } catch (error) {
            console.log('error en operacion contra mongo al crear nueva direccion de contacto y modificar cliente...',error);
            _session.abortTransaction();
        }
    }

    //genero factura pdf y mando por correo
    var _factura=new PDFDocument();
    _factura.pipe(fs.createWriteStream(`${__dirname}/../infraestructura/facturas_pdf/factura__${clientesesion._id.toString()}__${clientesesion.pedidoActual._id.toString()}.pdf`));
    _factura.fontSize(12).text(`RESUMEN DEL PEDIDO CON ID: ${clientesession.pedidoActual._id.toString()}`);
    var _filas = [];
    clientesession.pedidoActual.elementosPedido.forEach( item => {
        _filas.push(
            [
                item.libroElemento.Titulo,
                item.libroElemento.Precio,
                item.cantidadElemento,
                (item.cantidadElemento * item.libroElemento.Precio)
            ]
        ); //cada fila q representa un item del pedido de la tabla es un array columnas...
    });
    _factura.table(
        {
            header:['Titulo del libro', 'Precio','Cantidad','Subtotal por Libro'],
            rows: _filas
        },
        { width: 300 }
    );
    _factura.fontSize(10).text('Subtotal pedido: ' + clientesession.pedidoActual.subTotalPedido + '€');
    _factura.fontSize(8).text('Gastos de envio: ' + clientesession.pedidoActual.gastosEnvio + '€');
    _factura.fontSize(12).text('Total pedido: ' + clientesession.pedidoActual.totalPedido + '€');

    _factura.end();
    //actualizo variable de sesion...

    var _pedidoactual = clientesession.pedidoActual;

    _clliente.pedidos.push(_pedidoactual);
    _cliente.pedidoActual={};

    req.session.datoscliente=clientesession;

    res.status(200).render('Pedido/FinalizarPedidoOK.hbs',{ layout: '__Layout.hbs', pedidoactual: _pedidoactual});
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
       
    },
    finalizarPedido: async(req,res,next) =>{
        try {
            var _cliente = req.session.datoscliente;
            var{
                direccionradios, //<--direccionprincipal o otradireccion
                calle,
                cp,
                pais,
                provincia,
                municipio,
                nombre,
                apellidos,
                email,
                telefono,
                otrosdatos,
                datosfactura, //<-- facturaempresa o facturaparticular
                nombreEmpresa,
                cifEmpresa,
                pagoradios, // <-- pagocard o pagopaypal
                ...tarjetacredito
            }=req.body;

            var _direccionPedido;
            if(direccionradios=="direccionprincipal")
            {
                _direccionPedido=_cliente.direcciones.filter( direc => direc.esPrincipal==true)[0];
            }
            else
            {
                //nueva direccion a almacenar en coleccion direcciones de mongo y en variable de sesion datoscliente
                _direccionPedido={
                    calle: calle,
                    cp: cp,
                    provincia: { PRO: provincia.split('-')[1], CPRO: provincia.split('-')[0], CCOM:''},
                    municipio: { CPRO: provincia.split('-')[0], CMUM: municipio.split('-')[0], DMUN50: municipio.split('-')[1], CUN:''},
                }
            }

            if(pagoradios=='pagocard'){
                //#region -------- pago con tarjeta de credito ---------
                    //habria que comprobar si el cliente esta dado de alta en stripe ya, incluida su tarjeta...
                    //1º crear un objeto Customer
                    var _customer=await stripe.customers.create(
                        {
                            email: _cliente.cuenta.email,
                            name: _cliente.nombre + " " + _cliente.apellidos,
                            phone: _cliente.telefono,
                            address:{
                                city: _direccionPedido.municipio.DMUN50,
                                country: _direccionPedido.pais,
                                state: _direccionPedido.provincia.PRO,
                                postal_code: _direccionPedido.cp,
                                line1: _direccionPedido.calle
                            },
                            metadata: { '_id': _cliente._id, 'fechaNacimiento': _cliente.fechaNacimiento }
                        }
                    );

                    console.log('cliente en stripe creado...',_customer);

                    //2º paso añadir tarjeta de credito al cliente, necesitas token para la tarjeta antes
                    //https://stripe.com/docs/api/tokens/create_card?lang=node

                    var _cardToken = await stripe.tokens.create(
                        {
                            card: {
                                number: tarjetacredito.numerocard,
                                cvc: tarjetacredito.cvv,
                                name: _cliente.nombre + " " + _cliente.apellidos, 
                                exp_month: tarjetacredito.mescard.split('-')[0],
                                exp_year: tarjetacredito.aniocard   
                            }
                        }
                    );
                    console.log('token de la tarjeta con exito...',_cardToken);

                    var _card=await stripe.customers.createSource(_customer.id, { source: _cardToken.id});

                    console.log('tarjeta asociada al cliente...',_card);

                    //3º paso generar el cargo a dicha tarjeta
                    //https://stripe.com/docs/api/charges/create?lang=node
                    var _cargo = await stripe.charges.create(
                        {
                            amount: _cliente.pedidoActual.totalPedido * 100,
                            currency: 'eur',
                            customer: _customer.id,
                            description: _cliente.pedidoActual._id,
                            source: _card.id
                        }
                    );
                    console.log('cargo creado a la tarjeta de forma correcta...',_cargo);

                    if(_cargo.status == "succeeded")
                    {
                        //metemos en mongodb la nueva direccion...
                        //crear pdf con la factura...
                        //redireccionar a vista FinalizarPedidoOk
                        console.log('vamos a generar la factura y demas cosas...');
                        await finalizarPedidoOK(
                                                direccionradios=='otradireccion' ? _direccionPedido: {},
                                                { nombrefactura: nombreEmpresa, idFactura: cifEmpresa},
                                                _cliente,
                                                req,
                                                res
                                                );
                    }
                    else
                    {
                        res.status(200).redirect('http://localhost:3000/Pedido/MostrarPedido');
                    }

                //#endregion

            }
            else{

                //#region -------- pago con paypal ---------
                //tengo q meter en variables de sesion los datos de la nueva direccion y los datos de la persona de contacto para la factura
                //para q pueda acceder a ellos la funcion de vuelta de paypal
                req.session.otradireccion=_direccionPedido;
                req.session.datosfacturacion= { nombrefactura: nombre, apellidosfactura: apellidos, telefonofactura: telefono, emailfactura: email};
                //nos creamos directamente el cargo contra paypal
                    var create_payment_json = {
                        "intent": "sale",
                        "payer": {
                            "payment_method": "paypal"
                        },
                        "redirect_urls": {
                            "return_url": `http://localhost:3000/Pedido/PayPalCallback?guid=${_cliente.pedidoActual._id}`,
                            "cancel_url": `http://localhost:3000/Pedido/PayPalCallback?guid=${_cliente.pedidoActual._id}&Cancel=true`
                        },
                        "transactions": 
                        [ //array de objetos transaccion, con una unica propiedad "item_list"
                            {
                                "item_list": { //dentro de la prop.item_list de cada transaccion, hay una propiedad "items"
                                                //q es un array de objetos de tipo item q representan cada elemento del pedido
                                "items": _cliente.pedidoActual
                                        .elementosPedido
                                        .map( itempedido =>{
                                                return {
                                                    "name": itempedido.libroElemento.Titulo,
                                                    "sku": itempedido.libroElemento.ISBN13,
                                                    "price": itempedido.libroElemento.Precio.toString(),
                                                    "currency": "EUR",
                                                    "quantity": itempedido.cantidadElemento
                                                }
                                            }
                                        )
          
                                },
                                "amount": {
                                    "currency": "EUR",
                                    "details": {
                                        "tax":"0",
                                        "shipping": _cliente.pedidoActual.gastosEnvio.toString(),
                                        "subtotal": _cliente.pedidoActual.subTotalPedido.toString()
                                    },
                                    "total": _cliente.pedidoActual.totalPedido.toString()
                                },
                                "description": `Pago del pedido en AGAPEA.COM con id: ${_cliente.pedidoActual._id} con fecha: ${_cliente.pedidoActual.fechaPedido.toString()}`
                            }
                        ]
                    }; 
                paypal.payment.create(create_payment_json, function name(error,payment) {
                    if(error){
                        throw error;
                    }
                    else{
                        //redirigir al cliente a paypal para q acepte el pago recien creado...usando las url q genera
                        //la propiedad "links" del objeto payment recien creado estan estas direcciones, hasy q usar la
                        //q contiene "approval_url" y redireccionar

                        var _urlPaypal= payment.links.filter(link => link.rel=='approval_url')[0].href;
                        res.redirect(_urlPaypal);
                       
                    }
                })
                //#endregion

            }
        } catch (error) {
            
        }
    },
    paypalcallback: async (req,res,next)=>{
        //en la url estan como parametros:
        // - guid <--- el id del pedido
        // - Cancel <--- si es true, es q el cliente ha cancelado el pago con paypal
        // - PayerID <--- añadido por paypal, el id del cliente en paypal
        // - paymentId <---añadido por paypal como el id del pago
        var _payerId=req.query.PayerID; 
        var _paymentId=req.query.paymentId; 
        var _guid=req.query.guid; 
        var _cancel=req.query.Cancel; 

        if(_cancel){
            //pago cancelado, mostramos errores en vista MostrarPedido
            req.session.errores='Pago cancelado en PayPal, intentalo por otro medio o mas tarde de nuevo con PayPal...'
            res.status(200).redirect('http://localhost:3000/Pedido/MostrarPedido');
        }

        //hacemos efectivo el pago del cliente
        paypal.payment.execute(_paymentId,
                                {"payer_id": _payerId},
                                async function(error,payment) {
                                    if(error){
                                        console.log('error a la hora de ejecutar l cobro del pago del cliente...',error);
                                        req.session.errores='Error a la hora de ejecutar el cobro del pago del cliente..., intentalo por otro medio o mas tarde de nuevo con PayPal...'
                                        res.status(200).redirect('http://localhost:3000/Pedido/MostrarPedido');
                                    }
                                    else{
                                        console.log('pago cargado correctamente...',payment);
                                        await finalizarPedidoOK(
                                            req.session.otradireccion,
                                            req.session.datosfacturacion,
                                            req.session.datoscliente,
                                            req,
                                            res
                                        );
                                    }
                                }      
                            );
    },
    mostrarPedido: async(req,res,next) => {
        var _cliente=req.session.datoscliente;
        await renderizarMostrarPedido(_cliente,req,res);
    }
}