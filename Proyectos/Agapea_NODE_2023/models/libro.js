var mongoose=require('mongoose');

var libroSchema=mongoose.Schema(
    {
        Titulo: { type: String, required: true},
        Editorial: { type: String, required: true},
        Autores: { type: String, required: true},
        Edicion: { type: String, required: true},
        NumeroPaginas: { type: Number, required: true},
        NumeroPaginas: { type: Number, required: true},
        Precio: { type: Number, required: true},
        ISBN10: { type: String, required: true},
        ISBN13: { type: String, required: true},
        Dimensiones: { type: String, default: ''},
        Resumen: { type: String, required: true},
        Idioma: { type: String, default: 'Español'},
        ImagenLibro: { type: String, default: 'imagen_minilibro_default.png'},
        ImagenLibroBASE64: { type: String, default: ''},
        Idioma: { type: String, default: ''},
        IdCategoria: { type: String, required: true},
    }
);

module.exports=mongoose.model('Libro', libroSchema, 'libros');