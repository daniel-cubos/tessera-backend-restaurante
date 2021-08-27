const jwt = require('jsonwebtoken');
const knex = require('../../bancodedados/conexao');
const schema = require('../../validacao/produstosSchema');

const ativarProduto = async (req, res) => {
	const { id } = req.params;
	const { authorization } = req.headers;

	try {
		await schema.consultarProduto.validate(req.params);

		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		const produto = await knex('produto').where({ id, restaurante_id }).first();

		if (produto.length === 0)
			return res.status(400).json('O produto não foi encontrado.');

		if (produto.ativo === true)
			return res.json("O produto já está ativo");

		const produtoAtivo = await knex('produto').where({ id }).update({ ativo: true });

		if (produtoAtivo.length === 0)
			return res.status(400).json('Erro ao ativar o produto.');

		return res.status(200).json('Produto ativado com sucesso!');
	}
	catch (error) {
		res.status(400).json(error.message);
	}
}

const desativarProduto = async (req, res) => {
	const { id } = req.params;
	const { authorization } = req.headers;

	try {
		await schema.consultarProduto.validate(req.params);

		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		const produto = await knex('produto').where({ id, restaurante_id }).first();

		if (produto.length === 0)
			return res.status(400).json('O produto não foi encontrado.');

		if (produto.ativo === false)
			return res.json("O produto já está desativado");

		const produtoDesativado = await knex('produto').where({ id }).update({ ativo: false });

		if (produtoDesativado.length === 0)
			return res.status(400).json('Não foi possível desativar o produto.');

		return res.status(200).json('Produto desativado com sucesso!');
	}
	catch (error) {
		res.status(400).json(error.message);
	}
}

module.exports =
{
	desativarProduto,
	ativarProduto
}