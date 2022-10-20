var express=require('express');
var router=express.Router();
var multer=require('multer'); //<-- middleware de nodejs para procesar datos enviados desde el cliente con formato MULTIPART-FORM-DATA
                              //<-- se configura usando la funcion multer( { json_configuraciones_storage } );

var uploadmiddleware=multer(
    {
        storage: multer.diskStorage(
            {
                destination: (req,file,callback)=> callback(null, __dirname + '/../uploads_imagenes/'),
                filename: (req,file,callback)=> {
                    console.log('File vale...',file);
                    var nombreImagen=`${file.originalname.split('.')[0]} - ${req.session.datoscliente._id.toString()}.${file.originalname.split('.')[1]}`;
                    callback(null, nombreImagen);
                }
            }
        )
    }
);

var servicioRESTController=require('../controllers/servicioRESTController');

router.post('/uploadImagen', servicioRESTController.uploadimagen);
router.post('/uploadImagenFichero', uploadmiddleware.single('fichimagen') ,servicioRESTController.uploadimagenFichero);

module.exports=router;