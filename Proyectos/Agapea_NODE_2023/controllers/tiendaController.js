var Categoria=require('../models/categoria');
var Libro=require('../models/libro');
var mongoose = require('mongoose');


async function recuperaCats(){
    try {
        var _listaCatPpales=await Categoria.find({IdCategoria: {$regex: /^[0-9]{1,}$/} }).lean();
        console.log(_listaCatPpales);

        return _listaCatPpales;

    } catch (error) {
        console.log('error al obtener categorias ppales...', error);
        return [];
    }

}

module.exports={
    recuperaLibros: async (req,res,next)=>{
        try {
        //1º acceder a mongodb para recuperar libros de una determinada categoria...
        //y pasarsela a la vista
        var _IdCategoria=req.params.idcat; //<--- si esto esta vacio, estamos en pagina de inicio, habria q recuperar los libros en oferta del mes o las novedades
        console.log('quieres recuperar los libros de la categoria...', _IdCategoria);

        var _listalibros=await Libro.find({ IdCategoria: new RegExp( "^" + _IdCategoria) }).lean();
        
        res.status(200).render('Tienda/Libros.hbs',
                                { 
                                    layout: '__Layout.hbs', 
                                    sinpanel: 'false',
                                    categorias: await recuperaCats(),
                                    cliente: req.session.datoscliente,
                                    _listalibros:_listalibros
                                }
                            );

        } catch (error) {
            console.log('error al intentar recuperar Libros...', error);

            res.status(200).render('Tienda/Libros.hbs',
                                { 
                                    layout: '__Layout.hbs', 
                                    sinpanel: 'false',
                                    categorias: await recuperaCats(),
                                    cliente: req.session.datoscliente,
                                    _listalibros:[]
                                }
                            );
        }
        
       
    }

}