var Categoria=require('../models/categoria');
var Libro=require('../models/libro');


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
        res.status(200).render('Tienda/Libros.hbs',
                                { 
                                    layout: '__Layout.hbs', 
                                    categorias: await recuperaCats(),
                                    cliente: req.session.datoscliente
                                }
                            );
    }

}