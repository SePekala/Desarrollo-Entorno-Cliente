//modulo node para definir funciones middleware a ejecutar cuando los clientes solicitan urls http://localhost:3000/Cliente/.....
//tiene q exportar un objeto Router
var express=require('express');
var router=express.Router();

var ClienteController = require('../controllers/clienteController');

router.route('/Login')
       .get( ClienteController.loginget )
       .post( ClienteController.loginpost );
       
router.route('/Registro')
        .get( ClienteController.registroget )
        .post( ClienteController.registropost );

router.get('/ActivarCuenta/:id' ,ClienteController.activarcuentaget);

router.get('/InicioPanel', ClienteController.iniciopanelget );

router.post('/UpdateDatosCliente',ClienteController.updateDatosCliente);

router.post('/OperaDireccion', ClienteController.operaDireccion);

module.exports=router;
