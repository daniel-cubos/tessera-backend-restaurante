const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../bancodedados/conexao');
const schema = require('../../validacao/usuarioSchema');

const fazerLogin = async (req, res) => {
	const { email, senha } = req.body;

	try {
		await schema.loginUsuario.validate(req.body);

		const usuario = await knex('usuario').where({ email }).first();

		if (!usuario)
			return res.status(404).json('Usuario não encontrado');

		const validarSenha = await bcrypt.compare(senha, usuario.senha);

		if (!validarSenha)
			return res.status(404).json('Email e senha não conferem');

		const token = jwt.sign({ id: usuario.id }, process.env.SENHA_JWT, { expiresIn: '8h' });

		return res.status(200).json({ token });
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const listagemDePedido = async (req, res) => {
	const { authorization } = req.headers;

	try {
		const listagemPedidos = [];

		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		const pedidos = await knex('pedido').where({ restaurante_id, enviado_entrega: false }).orderBy('id', 'asc');

		for (let pedido of pedidos) {
			const produtosCarrinho = [];

			const { id: pedido_id } = pedido;
			const { cliente_id } = await knex('pedido').where({ id: pedido_id }).first();

			const infoConsumidor = await knex('endereco').where({ cliente_id })
				.join('cliente', 'cliente.id', 'endereco.cliente_id').first();

			const produtosSolicitados = await knex('itens_pedido').where({ pedido_id })
				.join('produto', 'produto.id', 'itens_pedido.produto_id').limit(2);

			for (let produto of produtosSolicitados) {
				produtosCarrinho.push({ nome: produto.nome, quantidade: produto.quantidade_itens })
			}

			const infos = {
				idPedido: pedido.id,
				nome: infoConsumidor.nome,
				cep: infoConsumidor.cep,
				endereco: infoConsumidor.endereco,
				complemento: infoConsumidor.complemento,
				carrinho: produtosCarrinho,
				totalPedido: pedido.total_pedido
			}

			listagemPedidos.push(infos)
		}
		return res.json(listagemPedidos);

	} catch (error) {
		return res.status(400).json(error.message);
	}
}

const detalhesDoPedido = async (req, res) => {
	const { idPedido: pedido_id } = req.params;

	try {
		const produtosCarrinho = [];
		const { cliente_id } = await knex('pedido').where({ id: pedido_id }).first();

		const infoConsumidor = await knex('endereco').where({ cliente_id })
			.join('cliente', 'cliente.id', 'endereco.cliente_id').first();

		const produtosSolicitados = await knex('itens_pedido').where({ pedido_id })
			.join('produto', 'produto.id', 'itens_pedido.produto_id');

		for (let produto of produtosSolicitados) {
			produtosCarrinho.push({ nome: produto.nome, quantidade: produto.quantidade_itens })
		}

		const infos = {
			nome: infoConsumidor.nome,
			cep: infoConsumidor.cep,
			endereco: infoConsumidor.endereco,
			complemento: infoConsumidor.complemento,
			carrinho: produtosCarrinho
		}

		return res.json(infos)
	} catch (error) {
		return res.status(400).json(error.message);
	}
}

module.exports =
{
	fazerLogin,
	listagemDePedido,
	detalhesDoPedido
}