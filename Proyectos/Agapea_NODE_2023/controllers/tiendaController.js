var Categoria=require('../models/categoria');
var Libro=require('../models/libro');

var _listaCatPrincipal=[];
Categoria.find( {idCategoria: { $regex: { } }} )
    .then(categs=> _listaCatPrincipal=categs)
    .catch(error => console.log('error al obtener categorias principakes...', error));

module.exports={
    recuperalibros: async (req,res,next)=>{
        res.status(200).render('Tienda/Libros.hbs',
                                { 
                                    layout: '__Layout.hbs', 
                                    categorias: _listaCatPrincipal, 
                                    cliente: res.session.datoscliente
                                }
                            );
    }

}