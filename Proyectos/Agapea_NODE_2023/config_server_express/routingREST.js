var express=require('express');
var router=express.Router();

var servicioRESTController=require('../controllers/servicioRESTController');

router.post('/uploadImagen', servicioRESTController.uploadimagen);

module.exports=router;