require('dotenv').config();//<---- definicion de variables de entorno en el sistema para config.express
var express=require('express');
var serverExpress=express();

var mongoose=require('mongoose');

var configServer=require('./config_server_express/pipelline_middleware');
//#region 
// (algo1,algo2) => {} funcion landa, lo mismo que function(algo1,algo2){}
/*
    cliente                           nodejs <Express>
http://servidor:3000/seg1/seg2-------> pipeline
                                    modulos middleware q procesan la peticion
                                    mod-1(procesa http-request) -             mod-2 ......
                                    serverExpress.use(function(req,res){})   servidorExpress.use((req,res)=>{})
                                        |                           |
                             <---------------------------------------
                             http-response           
*/ 
configServer(serverExpress);

serverExpress.listen(3000);
//#endregion



//#region  --------------------------  configuracion CONEXION MONGODB SERVER ---------------
mongoose.connect(process.env.CONNECTION_MONGODB,(err) => {
    if(!err){
        console.log('...conectados al servidor MONGODB a la bd Agapea, al puerto 27017...');
    }else{
        console.log('error en conexion a MONGODB: ',err);
    }
});