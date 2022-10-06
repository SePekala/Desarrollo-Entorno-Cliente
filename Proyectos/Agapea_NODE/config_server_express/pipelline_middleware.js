// modulo de express q va a servir para configurar la pipeline de la instancia del servidor express
//creado en el modulo principal:    SEREVR.JS
//este modulo va a exportar una funcion q recibe como parametro el servidor express a configurar y dentro
//de la misma se configura la pipeline de ese servidor
//instalar plugins : npm install plugin-name --save
var express=require('express');

var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
const session = require('express-session');
var ViewEngine=require('express-handlebars');

var configRoutingLine=require('./routingMAIN');

module.exports=function(servidorExpress){

    //modulos middleware a configurar en la pipeline (funciones que admiten 3 parametros (req,res,next) )
    servidorExpress.use(cookieParser()); //<---1º modulo middleware gestión cookies de sesion mandadas por cliente: cookie-par
                                         //coge la cookie de las cabecera http del http-request del cliente y creea un objeto
                                         //en req.cookie
    servidorExpress.use(bodyParser.urlencoded({ extended : false}));//<----2º modulo middleware gestion de los datos mandados por el cliente por POST (formulario)
                                                                    //los mete en variable req.bodys
                                                                    //                                                              x-www-form-urlencodeds
    servidorExpress.use(bodyParser.json());                         //el 2º es para datos mandados en formato JSON
    
    servidorExpress.use(    //<--------3º modulo midleware conf.del estado de sesion en el servidor express: paquete express-session
            session(
                {
                    secret: process.env.SECRET_KEY_SESSIONS_ID,
                    resave: false,
                    saveUninitialized: true,
                    cookie:{
                        path:'/',
                        httpOnly:true,
                        maxAge:3600000,
                        secure:false

                    }

                }
            )

    ); 

    //me creo una variable para el servidor express llamada 'views' donde esta el diccionario de las vistas handlebars
    servidorExpress.set('views',__dirname + '/../views');

    servidorExpress.engine(//<------ 4º  modulo middleware conf.view-engine (motor de vistas para el servidor): exepress-HANDLEBARS, se usa metodo .engine de la insatalacion
        'hbs',
        ViewEngine.create(
            {
                //JSON con opciones de configuracion de handlebars
                extname: 'hbs',
                defaultLayout:'__Layout',
                layoutsDir: __dirname + '../views/shared/Layouts',
                partialsDir: __dirname + '../views/shared/Partials',
                helpers:{ } //funciones javascript q pueden ser invocadas desde una vista handlebars
            }
        ).engine
        );
    servidorExpress.use('/public',express.static('public',{ index: false }));

    //5º modulo middleware ROUTING-MODULE
    
    configRoutingLine(servidorExpress);
}