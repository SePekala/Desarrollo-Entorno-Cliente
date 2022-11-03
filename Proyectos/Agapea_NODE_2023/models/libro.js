var mongoose=require('mongoose');

var libroSchema=mongoose.Schema(
    {
        titulo: { type: String, required: true},
        editorial: { type: String, required: true},
        autores: { type: String, required: true},
        edicion: { type: String, required: true},
        numeroPaginas: { type: Number, required: true},
        numeroPaginas: { type: Number, required: true},
        precio: { type: Number, required: true},
        isbn10: { type: String, required: true},
        isbn10: { type: String, required: true},
        dimensiones: { type: String, default: ''},
        resumen: { type: String, required: true},
        idioma: { type: String, default: 'Español'},
        imagenLibro: { type: String, default: 'imagen_minilibro_default.png'},
        imagenLibroBASE64: { type: String, default: ''},
        idioma: { type: String, default: ''},
        idCategoria: { type: String, required: true},
    }
);

module.exports=mongoose.model('Libro', libroSchema, 'libros');