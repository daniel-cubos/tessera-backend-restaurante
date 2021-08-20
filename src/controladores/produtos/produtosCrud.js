const jwt = require('jsonwebtoken');
const knex = require('../../bancodedados/conexao');
const schema = require('../../validacao/produstosSchema');
const { uploadImagem, atualizarImagem } = require('../../supabase')

const consultarProdutos = async (req,res) =>
{
    const { id } = req.params;    
    const { authorization } = req.headers;

    try 
    {        
        const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
        const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();
        
        if(id)
        {
            await schema.consultarProduto.validate(req.params);
            const produto = await knex('produto').where({ id, restaurante_id }).returning('*');

            if(produto.length === 0)
                return res.status(404).json('Restaurante não possui o produto com a id cadastrada.');

            return res.status(200).json(produto);
        }
    
        const produto = await knex('produto').where({ restaurante_id });        
        return res.status(200).json(produto);
    }
    catch (error)
    {
        return res.status(400).json(error.message);
    }
}

const cadastrarProdutos = async (req,res) =>
{
    const { authorization } = req.headers;
    const { nome, descricao, preco, permiteObservacoes: permite_observacoes, imagemProduto } = req.body; 
    
    try
    {
        const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
        const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();
        
        await schema.cadastrarProduto.validate(req.body);

        const novoProduto = 
        {
            nome,
            preco,
            descricao,
            restaurante_id,
            permite_observacoes
        }

        const produto = await knex('produto').insert(novoProduto).returning('*');
        
        if(imagemProduto)
        {
            const caminhoImagem = 'restaurante_' + restaurante_id.toString() + '/produtos/' + produto[0].id.toString() + '.jpg';
            const uploadImage = uploadImagem(imagemProduto, caminhoImagem)

            if(uploadImage.length === 0)
                return res.status(400).json(uploadImage)
        }

        if(produto.length === 0)
            return res.status(400).json('Não foi possivel cadastrar o produto.');

        return res.status(200).json('Produto inserido com sucesso!');
    }
    catch (error)
    {
        return res.status(400).json(error.message);
    }
}

const editarProdutos = async (req,res) =>
{
    const { id } = req.params;
    const { authorization } = req.headers;
    const { nome, descricao, preco, permiteObservacoes: permite_observacoes, imagemProduto } = req.body;    
        
    try 
    {
        const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
        const { id: restaurante_id, nome: nome_restaurante } = await knex('restaurante').where({ usuario_id }).first();
    
        await schema.editarProduto.validate(req.body);
        
        const produto = await knex('produto').where({ id , restaurante_id });

        if(produto.length === 0)
            return res.status(404).json('O produto não foi encontrado!');
        
        if(imagemProduto)
        {
            const caminhoImagem = 'restaurante_' + restaurante_id.toString() + '/produtos/' + id.toString() + '.jpg';
            const attImage = atualizarImagem(imagemProduto, caminhoImagem)
    
            if(attImage.length === 0)
                return res.status(400).json(attImage)
        }
    
        const produtoAtualizado = await knex('produto').where({ id })
        .update({ nome, descricao, preco, permite_observacoes });
        
        if (produtoAtualizado.length === 0) 
            return res.status(400).json('Erro na atualização.');
        
        return res.status(200).json('Produto atualizado com sucesso!');
    } 
    catch (error) 
    {
        return res.status(400).json(error.message);       
    }
}

const deletarProdutos = async (req,res) =>
{
    const { id } = req.params;
    const { authorization } = req.headers;

    try 
    {        
        const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
        const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();
        
        await schema.deletarProdutos.validate(req.params);

        const produto = await knex('produto').where({ id, restaurante_id });

        if(produto.length === 0)
            return res.status(404).json('O produto não foi encontrado!');    

        const produtoDeletado = await knex('produto').where({ id }).del().returning('*');
            
        if(produtoDeletado.length === 0)
            return res.status(400).json('Não foi possivel remover o produto');
        
        return res.status(200).json('Produto removido com sucesso!');
    } 
    catch (error) 
    {
        return res.status(400).json(error.message);    
    }
}


module.exports = 
{ 
    cadastrarProdutos,
    consultarProdutos,
    editarProdutos,
    deletarProdutos
}