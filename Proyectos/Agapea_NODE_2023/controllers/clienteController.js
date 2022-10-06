//modulo de node q define un objeto javascript q tiene como metodos las funciones middleware a ejecutar con las rutas /Cliente/,,,
//var mailjet=require('node-mailjet');
var mongoose=require('mongoose');
var bcryptjs=require('bcryptjs');

var Cliente=require('../models/cliente');
var Cuenta=require('../models/cuenta');

var MandarMail=require('../models/enviarMailjet');

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
            var _idCuenta=new mongoose.Types.ObjectId();
            var _cuentaCliente=new Cuenta(
                {
                    _id: _idCuenta,
                    login: req.body.login,
                    email: req.body.email,
                    password: bcryptjs.hashSync(req.body.password)
                }
            );

            var _clienteNuevo=new Cliente(
                {
                    nombre: req.body.nombre,
                    apellidos: req.body.apellidos,
                    telefono: req.body.telefono,
                    cuenta: _idCuenta
                }
            );

            var _resultValidacionCuenta=await _cuentaCliente.validate();
            var _resultValidacionCliente=await _clienteNuevo.validate();

            console.log(_resultValidacionCuenta);
            console.log(_resultValidacionCliente);

            if(_resultValidacionCuenta == null && _resultValidacionCliente == null){
                    await _cuentaCliente.save();
                    await _clienteNuevo.save();
                    //3º si todo ok mandar email de activacion de cuenta usando node-mailjet, y  redireccionar a vista RegistroOK
                    MandarMail.MandarMailJet(_cuentaCliente.email);
                    res.status(200).render('Cliente/RegistroOK.hbs',{ layout:null }); 

            } else {
                res.status(200).render('Cliente/Registro.hbs',{ 
                                                            layout: null, 
                                                            validacionCliente:_resultValidacionCliente,
                                                            validacionCuenta: _resultValidacionCuenta
                                                        }
                                        );

            }
            
        } catch (error) {
            //errores por validacion incorrecta en props de los objetos mongoose
            console.log(error);
            res.status(200).render('Cliente/Registro.hbs',{ layout: null, errorServer:'Ha habido un error interno en el server, intentalo de nuevo mas tarde'})
        }




    }

}