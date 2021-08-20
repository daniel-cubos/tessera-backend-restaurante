const knex = require('../../bancodedados/conexao');

const consultarCategoria = async (req,res) =>
{
    const { id } = req.params;    

    try 
    {   
        if(id)
        {
            const categoria = await knex('categoria').where({ id }).returning('*');

            if(categoria.length === 0)
                return res.status(400).json('Categoria Inexistente.');

            return res.status(200).json(categoria);
        }
        
        const cateogira = await knex('categoria').returning('*');
        
        if(cateogira.length === 0)
            return res.status(400).json('Falha ao retornar categorias');

        return res.status(200).json(cateogira);
    }
    catch (error) 
    {
        return res.status(400).json(error.message);      
    }
}

const cadastrarCategoria = async (req,res) =>
{
    const { nome, imgem: img_categoria } = req.body; 

    try
    {        
        const categoria = await knex('categoria').insert({ nome, img_categoria }).returning('*');
        
        if(categoria.length === 0)
            return res.status(400).json('Não foi possivel cadastrar a categoria.');

        return res.status(200).json('Categoria inserida com sucesso!');
    }
    catch (error)
    {
        return res.status(400).json(error.message);
    }
}

const editarCategoria = async (req,res) =>
{
    const { id } = req.params;
    const { nome, imgem: img_categoria } = req.body;    
        
    try 
    {
        const categoria = await knex('categoria').where({ id });

        if(categoria.length === 0)
            return res.status(404).json('A categoria não foi encontrada!');
            
        const categoriaAtualizada = await knex('categoria').where({ id }).update({ nome, img_categoria }).returning('*');

        if (categoriaAtualizada.length === 0) 
            return res.status(400).json('Erro na atualização.');
        
        return res.status(200).json('Categoria atualizada com sucesso!');
    } 
    catch (error) 
    {
        return res.status(400).json(error.message);       
    }
}

const deletarCategoria = async (req,res) =>
{
    const { id } = req.params;

    try 
    {
        const categoria = await knex('categoria').where({ id });
        
        if(categoria.length === 0)
            return res.status(404).json('A categoria não foi encontrada!');
            
        const categoriaDeletada = await knex('categoria').where({ id }).del().returning('*');
            
        if(categoriaDeletada.length === 0)
            return res.status(400).json('Não foi possivel remover a categoria');
        
        return res.status(200).json('Categoria removida com sucesso!');
    }
    catch (error) 
    {
        return res.status(400).json(error.message);    
    }
}


module.exports = 
{ 
    cadastrarCategoria,
    consultarCategoria,
    editarCategoria,
    deletarCategoria
}