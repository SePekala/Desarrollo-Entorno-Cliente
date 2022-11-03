//modulo node para definir funciones middleware a ejecutar cuando los clientes solicitan urls http://localhost:3000/Tienda/.....
//tiene q exportar un objeto Router
var express=require('express');
const { model } = require('mongoose');
var router=express.Router();

var TiendaController=require('../controllers/tiendaController');

router.get('/RecuperaLibros', TiendaController.recuperaLibros);

model.exports=router;