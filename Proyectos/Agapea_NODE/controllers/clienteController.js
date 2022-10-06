//modulo de node q define un objeto javascript q tiene como metodos las funciones middleware a ejecutar con las rutas /Cliente/..
var mongoose=require('mongoose');
var mailjet=require('node-mailjet');
var bcryptjs=require('bcrypt');

var Cliente=require('../models/cliente');
var Cuenta=require('../models/cuenta');

module.exports={
    loginget: (req,res,next)=>{},
    loginpost: (req,res,next)=>{},
    registroget: (req,res,next)=>{
            //devolver al cliente la vista de registro en la respuesta http-response
            res.status(200).render(
                'Cliente/Registro.hbs',{ layout: null }
            );

    },
    registropost: async (req,res,next)=>{
        try {
            console.log(req.body);//en req.body hay un obj.javascript con props los atributos name de los input del form
            //1º validar,si todo ok...

            //2º insertar datos en mongodb utilizando mongose
            var _idCuenta= new mongoose.Types.ObjectId();
            
            var _CuentaCliente= await new Cuenta(
                {
                    _id: _idCuenta,
                    login: req.body.login,
                    email: req.body.email,
                    password: bcryptjs.hashSync(req.body.password)

                }
            );
            var _resultValidacionCuenta= await _CuentaCliente.validate();

            console.log(_resultValidacionCuenta);

            if(_resultValidacionCuenta == null){
                var _clienteNuevo= new Cliente(
                    {
                        nombre: req.body.nombre,
                        apellidos: req.body.apellidos,
                        telefono: req.body.telefono,
                        cuenta: _idCuenta
                    }
                );

                var _resultValidacionCliente= await _clienteNuevo.validate();
                console.log(_resultValidacionCliente);

                if(_resultValidacionCliente == null){
                    await _CuentaCliente.save();
                    await _clienteNuevo.save();
    
                    //3º si todo ok redireccionar a vista RegistroOK
                    res.status(200).render('Cliente/RegistroOk.hbs',{layout: null});    
                }
                else{
                    res.status(200).render('Cliente/RegistroOk.hbs',{layout: null, _resultValidacionCliente});  
                }
            }
            else{
                res.status(200).render('Cliente/Registro.hbs',{layout: null, _resultValidacionCuenta});  
            }
            
            
        } catch (error) {
            //errores por validaciones incorrectas en props de los objetos mongoose
            console.log(error);
            res.status(200).render('Cliente/Registro.hbs',{ layout: null, errorServer:'Ha habido un error interno en el server, intentalo mas tarde' });  
        }
            
    }
}