const jwt = require('jsonwebtoken');
const knex = require('../../bancodedados/conexao');
const schema = require('../../validacao/produstosSchema');
const { uploadImagem, atualizarImagem, pegarUrlImagem, tratarBase64 } = require('../../supabase')

const consultarProdutos = async (req, res) => {
	const { id } = req.params;
	const { authorization } = req.headers;

	try {
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		if (id) {
			await schema.consultarProduto.validate(req.params);
			const produto = await knex('produto').where({ id, restaurante_id }).returning('*');

			if (produto.length === 0)
				return res.status(404).json('Restaurante não possui o produto com a id cadastrada.');

			return res.status(200).json(produto);
		}

		const produto = await knex('produto').where({ restaurante_id });
		return res.status(200).json(produto);
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const cadastrarProdutos = async (req, res) => {
	const { authorization } = req.headers;
	const requisicaoProduto = req.body;

	try {
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		await schema.cadastrarProduto.validate(req.body);

		const novoProduto =
		{
			restaurante_id,
			nome: requisicaoProduto.nome,
			preco: requisicaoProduto.preco,
			ativo: requisicaoProduto.ativo,
			descricao: requisicaoProduto.descricao,
			permite_observacoes: requisicaoProduto.permiteObservacoes
		}

		const produtoCadastrado = await knex('produto').insert(novoProduto).returning('*');

		if (produtoCadastrado.length === 0)
			return res.status(400).json('Não foi possivel cadastrar o produto.');

		if (requisicaoProduto.imagemProduto) {
			const { infoBase64, infoExtensao } = tratarBase64(requisicaoProduto.imagemProduto);

			const caminhoImagem = 'restaurante_' + restaurante_id.toString() + '/produtos/' + produtoCadastrado[0].id.toString() + '.' + infoExtensao;
			const uploadImage = uploadImagem(infoBase64, caminhoImagem);

			if (uploadImage.length === 0)
				return res.status(400).json(uploadImage);

			const urlImagem = await pegarUrlImagem(caminhoImagem);
			const urlCadastrada = await knex('produto').where({ id: produtoCadastrado[0].id }).update({ img_produto: urlImagem });

			if (urlCadastrada.length === 0)
				return res.status(400).json('Não foi possível realizar o cadastro da imagem do restaurante.');
		}
		return res.status(200).json('Produto inserido com sucesso!');
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const editarProdutos = async (req, res) => {
	const { id } = req.params;
	const { authorization } = req.headers;
	const requisicaoProduto = req.body;

	try {
		let urlImagem;
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		await schema.editarProduto.validate(req.body);

		const produto = await knex('produto').where({ id, restaurante_id });

		if (produto.length === 0)
			return res.status(404).json('O produto não foi encontrado!');

		if (requisicaoProduto.imagemProduto) {
			const { infoBase64, infoExtensao } = tratarBase64(requisicaoProduto.imagemProduto);

			const caminhoImagem = 'restaurante_' + restaurante_id.toString() + '/produtos/' + id.toString() + '.' + infoExtensao;
			const attImage = await atualizarImagem(infoBase64, caminhoImagem)

			if (attImage.length === 0)
				return res.status(400).json(attImage)

			urlImagem = await pegarUrlImagem(caminhoImagem);
		}

		const atualizarProduto =
		{
			img_produto: urlImagem,
			nome: requisicaoProduto.nome,
			ativo: requisicaoProduto.ativo,
			preco: requisicaoProduto.preco,
			descricao: requisicaoProduto.descricao,
			permite_observacoes: requisicaoProduto.permiteObservacoes
		}

		const produtoAtualizado = await knex('produto').where({ id }).update(atualizarProduto);

		if (produtoAtualizado.length === 0)
			return res.status(400).json('Erro na atualização do produto.');

		return res.status(200).json('Produto atualizado com sucesso!');
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const deletarProdutos = async (req, res) => {
	const { id } = req.params;
	const { authorization } = req.headers;

	try {
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		await schema.deletarProdutos.validate(req.params);

		const produto = await knex('produto').where({ id, restaurante_id });

		if (produto.length === 0)
			return res.status(404).json('O produto não foi encontrado!');

		const produtoDeletado = await knex('produto').where({ id }).del().returning('*');

		if (produtoDeletado.length === 0)
			return res.status(400).json('Não foi possivel remover o produto');

		return res.status(200).json('Produto removido com sucesso!');
	}
	catch (error) {
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