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

//#region ...rutas para acceder panel del cliente...
//--------------------------------------------------
function cargaPanelCliente(req,res,next){
        var _listaOpc=[ 
              "Inicio-InicioPanel",
              "Mis Compras-MisCompras",
              "Mis Opiniones-MisOpiniones",
              "Mis Listas-MisListas"
              ];
              req.opcPanelCliente=_listaOpc;
              next();      
  }
  
router.all("/Panel/*",cargaPanelCliente);

router.get( '/Panel/InicioPanel',ClienteController.iniciopanelget );
router.get( '/Panel/MisCompras',ClienteController.miscomprasget );
router.post('/Panel/UpdateDatosCliente', ClienteController.updateDatosCliente);
router.post('/Panel/OperaDireccion', ClienteController.operaDireccion);

//#endregion

// router.get('/InicioPanel', ClienteController.iniciopanelget );

// router.post('/UpdateDatosCliente',ClienteController.updateDatosCliente);

// router.post('/OperaDireccion', ClienteController.operaDireccion);

module.exports=router;
