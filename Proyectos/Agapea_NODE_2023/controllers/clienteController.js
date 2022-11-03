//modulo de node q define un objeto javascript q tiene como metodos las funciones middleware a ejecutar con las rutas /Cliente/,,,
//var mailjet=require('node-mailjet');
var mongoose = require('mongoose');
var bcryptjs = require('bcryptjs');
var axios=require('axios');

var Cliente = require('../models/cliente');
var Cuenta = require('../models/cuenta');
var Direccion = require('../models/direccion');

var MandarMail = require('../models/enviarMailjet');

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

                if (!_cuenta.cuentaActiva) throw new Error({ number: 1, message: 'cuenta inactiva' });
                //2º meter en estado de sesion el objeto cliente q tiene esas credenciales
                var _cliente = await Cliente.findOne({ cuenta: _cuenta._id })
                    .populate(
                        [
                            { path: 'cuenta', model: 'Cuenta' },
                            { path: 'direcciones', model: 'Direccion'}
                            // { path: 'pedidos', model: 'Pedido'}
                        ]
                    ); //<--OJO!! antes de almacenar los datos del cliente en la sesion
                //expandir props: direcciones,pedidos, cuenta y crear pedidoActual

                if (!_cliente) throw new Error({ number: 2, message: 'esa cuenta no existe en cliente' });
                req.session.datoscliente = _cliente;
                //3º redireccionar a InicioPanel
                res.status(200).redirect('http://localhost:3000/Cliente/InicioPanel');
            }
            else {
                throw new Error({ number: 3, message: 'password invalida' });
            }
        } catch (error) {
            //errores de password o email invalidos o cuenta no activada...
            console.log('error en recuperacion credenciales...', error);

            switch (error.number) {
                case 1:
                    //mandar de nuevo email de activacion y redirigir a vista de q se le ha mandado un nuevo email...
                    break;

                default:
                    error.message = '*Email o Contraseña incorrectos, intentelo de nuevo';

                    break;
            }
            res.status(200).render('Cliente/Login.hbs', { layout: null, errorMessagge: error.message });
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
        // NECESITO RECUPERAR LAS PROVINCIAS HACIENDO UN PET.AL SERVICIO net
        var _respRest={};

        try {

            var _respRest=await axios.get('https://apiv1.geoapi.es/provincias?type=JSON&key=&sandbox=1'); //json formato: {update_time:'', size:xx,data[]}
            console.log('datos recibidos...', _respRest);

        } catch (error) {
            console.log('error en peticion rest a la hora de obtener provincias...', error);
            _respRest={ data:[]};
        }
        finally
        {
            res.status(200).render('Cliente/InicioPanel.hbs',
            {
                layout: '__LayoutPanelCliente.hbs',
                cliente: req.session.datoscliente,
                dias: Array.from({ length: 31 }, (el, pos) => pos + 1),
                meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                anios: Array.from({ length: new Date(Date.now()).getFullYear() - 1933 }, (el, pos) => pos + 1934),
                provincias: _respRest.data.data
            }
            );
        }
        
    },
    updateDatosCliente: async (req, res, next) => {

        try {
            // modificar las props. del objeto cliente que hay en el estado de sesion con los valores pasados en el formulario
            // volcarlos en mongodb en la coleccion clientes y cuentas(si la password no esta en blanco)
            // VOLVER A ACTUALIZAR ESTADO DE SESSION con los datos del cliente modificados...
            console.log(req.body);

            var _fechanac;
            var _datoscliente=req.session.datoscliente;
            var camposcuenta=[]; //<---- en este array almaceno las props. del modelo Cuenta q quiero modificar
            var camposcliente=[]; //<---- en este array almaceno las props. del modelo Cliente q quiero modificar

            //req.body={nombre:'....',apellidos:'....',password:'....',repassword:'....',genero:'....',login:'....',dia:'....',mes:'....',anio:'....',descipcion:'....'}
            var {dia,mes,anio,password,repassword,login, ...cliente}=req.body;

            if (req.body.dia != -1 && req.body.mes != -1 && req.body.anio != -1) _fechanac = new Date(anio, mes, req.body.dia);
            if (password == repassword) camposcuenta.push('password');
            if (login != _datoscliente.cuenta.login) camposcuenta.push('login');
            if(camposcuenta.length != 0){
                //tengo q modificar cuenta...
                //update de cuenta...
                var _resultUpdateCuenta = await Cuenta.findOneAndUpdate(
                    { _id: req.session.datoscliente.cuenta._id },
                    { login: login, password: bcryptjs.hashSync(password) },
                    { new: true, runValidators: true, fields: camposcuenta }
                );

                console.log(_resultUpdateCuenta);
            }

            // me tengo que recorrer el objeto "cliente" creado a partir del req.body, propiedad por propiedad comparandolo
            // con el objeto cliente q tengo la sesion y la prop. q haya cambiado la meto en el array camposcliente
            cliente.fechaNacimiento=_fechanac;

            //Object.keys(cliente).forEach((prop) => cliente[prop] != _datoscliente[prop] ? (camposcliente.push(prop), _datoscliente[prop]=cliente[prop]) : false)
            
            Object.keys(cliente).forEach(
                (prop) => {
                    if(cliente[prop] != _datoscliente[prop]) //_datoscliente[prop] es lo mismo que _datoscliente.prop
                    {
                        
                        camposcliente.push(prop); // almaceno en el array de props cliente a modificar esa prop
                        _datoscliente[prop]=cliente[prop]; // actualizo el obj cliente q estaba en la sesion con el nuevo valor, para almacenar despues
                    }
                }
            );

            if(camposcliente.length != 0){
                var _resultUpdateCliente=await Cliente.findOneAndUpdate(
                    { _id: _datoscliente._id },
                    cliente,
                    { new:true, runValidators: true, fields: camposcliente }
                );
            console.log(_resultUpdateCliente);

            }

            req.session.datoscliente=_datoscliente;
            res.status(200).redirect('http://localhost:3000/Cliente/InicioPanel');
           
        } catch (error) {
            console.log('error al modificar datos cliente/cuenta.....', error);
            res.status(200).redirect('http://localhost:3000/Cliente/InicioPanel');
        }
        
    },
    operaDireccion: async (req,res,next) => {
        try {
            console.log(req.body); //campos del formulario: calle,cp,pais,provincia,municipio,operacion
            var{operacion,provincia,municipio, ...direc}=req.body;
            var _cliente=req.session.datoscliente; //<---------- datos de sesion cliente

            var _session=await mongoose.connection.startSession();
            await _session.startTransaction();

            switch (operacion.split('_')[0]) {
                case 'crear':
                    //1º insertar datos en nueva direccion en coleccion direcciones
                    var _idDirec=new mongoose.Types.ObjectId();
                    var _insertDirecc=await new Direccion(
                        {
                            _id: _idDirec,
                            provincia: { CPRO: provincia.split('-')[0], PRO: provincia.split('-')[1]},
                            municipio: { CPRO: provincia.split('-')[0], CMUM: municipio.split('-')[0], DMUN50: municipio.split('-')[1]},
                            ...direc
                        }
                    ).save({ session : _session});

                    console.log('resultado insert en coleccion direcciones...', _insertDirecc);
                    //2º actualizar coleccion clientes con el _id del cliente en variable de sesion la prop.direcciones y
                    //añadir al array el nuevo _id de la direccion creada
                    var _updateClientes=await Cliente.findByIdAndUpdate({ _id: _cliente._id }, {$push: { direcciones: _idDirec } }).session(_session);
                    console.log('resultado update en coleccion clientes...', _updateClientes);

                    await _session.commitTransaction();

                    //3º modificar la variable de sesion datoscliente añadiendo direccion nueva a prop.direcciones
                    _cliente.direcciones.push(_insertDirecc);
                    req.session.datoscliente=_cliente;

                    //4º redireccionar a InicioPanel
                    break;
            
                case 'modificar':
                    //1º modificar datos de la direccion con el _id Direccion pasado en la variable "operacion"
                    var _idDireccion=operacion.split('_')[1];

                    var _updateDireccion = await Direccion.findByIdAndUpdate(
                        { _id: _idDireccion},
                        { $set: 
                            {
                            provincia: { CPRO: provincia.split('-')[0], PRO: provincia.split('-')[1]},
                            municipio: { CPRO: provincia.split('-')[0], CMUM: municipio.split('-')[0], DMUN50: municipio.split('-')[1]},
                            ...direc
                            }
                        },
                        { new: true}
                    );
                    //2º modificar variable de sesion datoscliente la direccion modificada de prop. direcciones
                    var _posDirec = _cliente.direcciones.findIndex( direc => direc._id == _idDireccion);
                    _cliente.direcciones[_posDirec]=_updateDireccion;

                    req.session.datoscliente=_cliente;

                    //3º redireccionar a InicioPanel
                    break;

                case 'borrar':
                    //1º borrar datos de la direccion con el _id Direccion pasado en la variable "operacion"
                    var _idDireccion=operacion.split('_')[1];
                    var _deleteDireccion=await Direccion.findByIdAndDelete({ _id: _idDireccion });
                    console.log('resiltado del borrado de la direccion...', _deleteDireccion);

                    //2º modificar variable de sesion datoscliente eliminando la direccion borrada
                    _cliente.direcciones=_cliente.direcciones.filter( el => el.id != _idDireccion);
                    req.session.datoscliente=_cliente;

                    //3º redireccionar a InicioPanel
                    
                    break;
            }
            res.status(200).redirect('http://localhost:3000/Cliente/InicioPanel');
        } catch (error) {
            console.log(error);
            await _session.abortTransaction();
        }
    }

}