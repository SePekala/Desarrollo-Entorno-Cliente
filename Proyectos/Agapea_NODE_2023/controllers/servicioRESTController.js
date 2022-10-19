var mongoose=require('mongoose');
var Cliente=require('../models/cliente');
var Cuenta=require('../models/cuenta');

module.exports={
    uploadimagen: async (req,res,next) => {
        //usando mongoose tengo que modificar la propiedad imagenAvatar de la cuenta del cliente
        //para recuperar el id de la cuenta a modificar necesito el obj cliente q esta en el estado de sesion
        //.updateOne(...)
        //como respuesta, al ser un servicio REST, un obj. json, { codigo:xx, mensaje:''}

        try { 
            console.log(req.body);

            console.log(req.session.datoscliente);
            var _idCuenta = req.session.datoscliente.cuenta;

            var _resultUpdate = await Cuenta.updateOne({ _idCuenta }, { imagenAvatar: req.body.fichero });

            console.log('resultado grabado imagen...',_resultUpdate);
            //OJO!! Si no encuentras el _id cuenta NO LANZA EXCEPCION...habria que controlar  prop. matchedCount == 1 o no
            //si la imagen no se ha modificado, se sube la misma, la prop. modifiedCount==0
            if(_resultUpdate.matchedCount != 1 ) throw new Error('Cuenta no encontrada...');
            if(_resultUpdate.modifiedCount == 1 ) throw new Error('Esa imagen ya está en la BD');

            res.status(200).send( { codigo:0,mensaje:'Imagen de cuenta subida correctamente al servidor' } );
            
        } catch (error) {
            
            console.log('fallo al almacenar imagen en la bd ',error);
            res.status(200).send( {codigo:1,mensaje:'Fallo interno en el servidor, intentalo mas tarde'} );
        }

    }

}