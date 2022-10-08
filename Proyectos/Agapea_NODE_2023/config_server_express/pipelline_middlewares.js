//modulo de express q va a servir para configurar la pipeline de la instancia del servidor express
//creado en el modulo principal:    server.js
//este modulo va a exportar una funcion q recibe como parametro el servidor express a configurar y dentro
//de la misma se configura la pipeline de ese servidor

var express=require('express');

var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
var session=require('express-session');
var viewEngine=require('express-handlebars');

var configRouting=require('./routingMAIN');



module.exports=function(servidorExpres){

    //modulos middleware a configurar en la pipeline (funciones q admiten 3 parametros (req,res,next) )

    servidorExpres.use( cookieParser() ); //<---1º modulo midleware gestion cookies de sesion mandadas por cliente: cookie-parser
                                          //coge la cookie de las cabeceras http del http-request del cliente y crea un objeto
                                          //en req.cookie
                        
    servidorExpres.use( bodyParser.urlencoded({ extended: false }) ); //<----2º modulo midleware: body-parser gestion de los datos mandados por el cliente por POST (formularios,etc)
                                                                      //los mete en variable req.body. El 1º es para datos tipo formulario:
                                                                      //                                                    x-www-form-urlencoded
    servidorExpres.use( bodyParser.json() );                          // el 2º es para datos mandados en formato JSON

    servidorExpres.use(   //<-------3º modulo midleware conf.del estado de sesion en el servidor express: paquete express-session
            session(
                {
                    secret: process.env.SECRETKEY_SESSIONS_ID,
                    resave: false,
                    saveUninitialized: true,
                    cookie:{
                        path:'/',
                        httpOnly:true,
                        maxAge:360000,
                        secure:false
                    }

                }
            )
    );

    //me creo una variable para el servidor express llamada 'views' donde esta el directorio de las vistas handlebars
    servidorExpres.set('views',__dirname + '/../views');

    servidorExpres.engine( //<----- 4º modulo middleware conf.view-engine (motor de vistas para el servidor):  express-HANDLEBARS, se usa metodo .engine de la instancia de express
                          'hbs',
                          viewEngine.create(
                            {
                                //json con opciones de configuracion de  handlebars
                                extname:'hbs',
                                defaultLayout:'__Layout',
                                layoutsDir: __dirname + '/../views/shared/Layouts',
                                partialsDir: __dirname + '/../views/shared/Partials',
                                helpers: { } //funciones javascript q pueden ser invocadas desde una vista handlebars
                            }
                          ).engine
                          ); 
     servidorExpres.use('/public', express.static('public',{ index: false }));

    //5º modulo middleware ROUTING-MODULE
    configRouting(servidorExpres);

}   







