//modulo de node q define un objeto javascript q tiene como metodos las funciones middleware a ejecutar con las rutas /Cliente/,,,
//var mailjet=require('node-mailjet');
var mongoose=require('mongoose');
var bcryptjs=require('bcryptjs');

var Cliente=require('../models/cliente');
var Cuenta=require('../models/cuenta');

var MandarMail=require('../models/enviarMailjet');
var metodoActivarCuenta=require('../models/activarCuenta');

module.exports={
    loginget: (req,res,next)=>{
        res.status(200).render(
            'Cliente/Login.hbs',{ layout: null }
        );
    },
    loginpost: (req,res,next)=>{},
    registroget: (req,res,next)=>{
            
        //devolver al cliente la vista de registro en la respuesta http-response
            res.status(200).render(
                'Cliente/Registro.hbs',{ layout: null }
            );

    },
    registropost: async (req,res,next)=>{

        try {
            console.log(req.body); //en req.body hay un obj.javascript con props los atributos name de los input del form
            
            //1º validar, si todo ok... insertar datos en mongodb utilizando mongoose
            var _session=await mongoose.connection.startSession(); 
            await _session.startTransaction();

            var _idCuenta=new mongoose.Types.ObjectId();

            var _cuentaCliente= await new Cuenta(
                {
                    _id: _idCuenta,
                    login: req.body.login,
                    email: req.body.email,
                    password: bcryptjs.hashSync(req.body.password)
                }
            ).save( {session: _session} );

            var _clienteNuevo=await new Cliente(
                {
                    nombre: req.body.nombre,
                    apellidos: req.body.apellidos,
                    telefono: req.body.telefono,
                    cuenta: _idCuenta
                }
            ).save( {session: _session} );;

            
            //3º si todo ok mandar email de activacion de cuenta usando node-mailjet, y  redireccionar a vista RegistroOK
            await _session.commitTransaction();

            console.log({_cuentaCliente});
            console.log({_clienteNuevo});

            const __bodyEmail = '<h3><strong>Se ha registrado correctamente en Agapea.com</strong></h3><br>Pulsa <a href=`http://localhost:3000/Cliente/Registro/activarcuentaget`>AQUI</a> para activar tu cuenta";'
            MandarMail(_cuentaCliente.email,"Activa tu cuenta en Agapea.com",__bodyEmail);
            res.status(200).render('Cliente/RegistroOK.hbs',{ layout:null }); 
            
        } catch (error) {
            //errores por: 
            //-validacion incorrecta en props de los objetos mongoose
            //-querys en la transaccion (.save en cuentas y clientes)
            console.log(error);

            await _session.abortTransaction();

            var _viewdata={ layout: null};
            // /^.*validation failed.*/.test(error.message) ? _viewdata.errores=error.errors: _viewdata.errorServer='* Ha habido un error interno del servidor';
            
            if(/^.*validation failed.*/.test(error.message)){
                _viewdata.errores=error.errors //es un objeto js: { login: {.... message: '......'},email: {'......'}}
            }
            else{
                _viewdata.errorServer='* Ha habido un error interno del servidor';
            }

            res.status(200).render('Cliente/Registro.hbs',_viewdata);
        }finally{

            await _session.endSession();
        }




    }
    /*activarcuentaget: (req,res,next)=>{
        if(res.status(200))
        {
            metodoActivarCuenta(id);
        }
       
    }*/

}