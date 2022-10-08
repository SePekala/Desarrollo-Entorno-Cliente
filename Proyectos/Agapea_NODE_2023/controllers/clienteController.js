//modulo de node q define un objeto javascript q tiene como metodos las funciones middleware a ejecutar con las rutas /Cliente/,,,
//var mailjet=require('node-mailjet');
var mongoose = require('mongoose');
var bcryptjs = require('bcryptjs');

var Cliente = require('../models/cliente');
var Cuenta = require('../models/cuenta');

var MandarMail = require('../models/enviarMailjet');
var metodoActivarCuenta = require('../models/activarCuenta');

module.exports = {
    loginget: (req, res, next) => {
        res.status(200).render(
            'Cliente/Login.hbs', { layout: null }
        );
    },
    loginpost: async (req, res, next) => {
        try {
            console.log('datos mandados por el usuario', req.body);
            //1º comprobar credenciales usando el email y la password recibidos en el req.body
            var _cuenta = await Cuenta.findOne({ email: req.body.email });

            if (bcryptjs.compareSync(req.body.password, _cuenta.password)) {

                if(!_cuenta.cuentaActiva) throw  new Error ({  number:1 , message: 'cuenta inactiva' });
                //2º meter en estado de sesion el objeto cliente q tiene esas credenciales
                var _cliente = await Cliente.findOne({ cuenta: _cuenta._id }); //<--OJO!! antes de almacenar los datos del cliente en la sesion
                                                                               //expandir props: direcciones,pedidos, cuenta y crear pedidoActual
                if(!_cliente) throw  new Error ({  number:2 , message: 'esa cuenta no existe en cliente' });
                req.session.datoscliente = _cliente;
                //3º redireccionar a InicioPanel
                res.status(200).redirect('http://localhost:3000/Cliente/InicioPanel');
            }
            else {
                throw  new Error ({  number:3 , message: 'password invalida' });
            }
        } catch (error) {
            //errores de password o email invalidos o cuenta no activada...
            console.log('error en recuperacion credenciales...', error);

            switch (error.number) {
                case 1:
                    //mandar de nuevo email de activacion y redirigir a vista de q se le ha mandado un nuevo email...
                    break;
            
                default:
                    error.message= '*Email o Contraseña incorrectos, intentelo de nuevo';

                    break;
            }
            res.status(200).render('Cliente/Login.hbs', {layout:null, errorMessagge: error.message});
        }

        //console.log('mongoose password' + _cuentaFind.password);
        //console.log('la otra' + req.body.password);
        //console.log('datos mandados por el usuario', req.body);

    },
    registroget: (req, res, next) => {

        //devolver al cliente la vista de registro en la respuesta http-response
        res.status(200).render(
            'Cliente/Registro.hbs', { layout: null }
        );

    },
    registropost: async (req, res, next) => {

        try {
            console.log(req.body); //en req.body hay un obj.javascript con props los atributos name de los input del form

            //1º validar, si todo ok... insertar datos en mongodb utilizando mongoose
            var _session = await mongoose.connection.startSession();
            await _session.startTransaction();

            var _idCuenta = new mongoose.Types.ObjectId();
            //---------------------------------------------------------------------------------------------------------------
            //---------------habria q comprobar si ya existe un email dado de alta con ese valor en la coleccion cuentas-----
            //---------------------------------------------------------------------------------------------------------------
            
            //---------------------------------------------------------------------------------------------------------------
            var _cuentaCliente = await new Cuenta(
                {
                    _id: _idCuenta,
                    login: req.body.login,
                    email: req.body.email,
                    password: bcryptjs.hashSync(req.body.password)
                }
            ).save({ session: _session });

            var _clienteNuevo = await new Cliente(
                {
                    nombre: req.body.nombre,
                    apellidos: req.body.apellidos,
                    telefono: req.body.telefono,
                    cuenta: _idCuenta
                }
            ).save({ session: _session });;


            //3º si todo ok mandar email de activacion de cuenta usando node-mailjet, y  redireccionar a vista RegistroOK
            await _session.commitTransaction();

            //mandamos mail de activacion de cuenta
            console.log({ _cuentaCliente });
            console.log({ _clienteNuevo });

            const __bodyEmail = `<h3><strong>Se ha registrado correctamente en Agapea.com</strong></h3><br>Pulsa <a href='http://localhost:3000/Cliente/ActivarCuenta/${_cuentaCliente._id}'>AQUI</a> para activar tu cuenta
                                 <br>
                                 <p>SI EL ENLACE NO FUNCIONA COPIA ESTA URL Y PONLA EN UNA PESTAÑA DE TU NAVEGADOR: http://localhost:3000/Cliente/ActivarCuenta/${_cuentaCliente._id}</p>;`
            MandarMail(_cuentaCliente.email, _clienteNuevo.nombre, "Activa tu cuenta en Agapea.com", __bodyEmail);
            res.status(200).render('Cliente/RegistroOK.hbs', { layout: null });

        } catch (error) {
            //errores por: 
            //-validacion incorrecta en props de los objetos mongoose
            //-querys en la transaccion (.save en cuentas y clientes)
            console.log(error);

            await _session.abortTransaction();

            var _viewdata = { layout: null };
            // /^.*validation failed.*/.test(error.message) ? _viewdata.errores=error.errors: _viewdata.errorServer='* Ha habido un error interno del servidor';
            
            if (/^.*validation failed.*/.test(error.message)) {
                _viewdata.errores = error.errors //es un objeto js: { login: {.... message: '......'},email: {'......'}}
            }
            else {
                _viewdata.errorServer = '* Ha habido un error interno del servidor';
            }

            res.status(200).render('Cliente/Registro.hbs', _viewdata);
        } finally {

            await _session.endSession();
        }




    },
    activarcuentaget: async (req, res, next) => {
        //tengo q modificar la cuenta en coleccion "cuentas" de mongodb y poner prop. cuentaActiva a true para el id cuenta
        //q pasan como 3 segmento

        try {
            var _idCuenta = req.params.id; //<--- nombre del parametro en la ruta en fichero routinCliente.js
            const filter = { _id: _idCuenta };
            const update = { cuentaActiva: true };

            var _resultUpdate = await Cuenta.findOneAndUpdate(filter, update);

            console.log('resultado del update en coleccion cuentas de mongodb', _resultUpdate);

            res.status(200).redirect('http://localhost:3000/Cliente/Login');

        } catch (error) {
            //error en el update...volver a mandar email y redirigir al registro OK
            console.log('errores en el update coleccion cuentas: ', error);
        }

    },
    iniciopanelget: async (req, res, next) => {

        //tengo que pasar objeto cliente recuperado del estado de sesion y el layout del panel cliente
        res.status(200).render(
            'Cliente/InicioPanel.hbs', { layout: '__LayoutPanelCliente.hbs' }
        );
    },
    iniciopanelpost: async (req, res, next) => {

    }

}