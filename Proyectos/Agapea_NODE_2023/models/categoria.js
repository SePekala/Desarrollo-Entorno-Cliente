var mongoose=require('mongoose');

var categoriaSchema=mongoose.Schema(
    {
        idCategoria: { type: String, required: true},
        nombreCategoria: { type: String, required: true}
    }
);

module.exports=mongoose.model('Categoria', categoriaSchema, 'categorias');