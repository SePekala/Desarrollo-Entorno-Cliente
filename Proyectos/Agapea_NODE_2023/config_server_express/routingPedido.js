var express=require('express');
var router=express.Router();

var PedidoController = require('../controllers/pedidoController');

router.get('/AddLibroPedido/:isbn13',PedidoController.addLibroPedido);
router.get('/SumarCantidadLibro/:isbn13',PedidoController.sumarCantidadLibro);
router.get('/RestarCantidadLibro/:isbn13',PedidoController.restarCantidadLibro);
router.get('/EliminarLibroPedido/:isbn13',PedidoController.eliminarLibroPedido)

module.exports=router;