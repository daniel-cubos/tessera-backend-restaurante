const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../bancodedados/conexao');
const schemaUsuario = require('../../validacao/usuarioSchema');
const { uploadImagem, atualizarImagem } = require('../../supabase');
const schemaRestaurante = require('../../validacao/restauranteSchema');

const cadastrarUsuario = async (req, res) => {
	const { restaurante, ...usuario } = req.body;

	try {
		await schemaUsuario.cadastrarUsuario.validate(usuario);
		await schemaRestaurante.cadastrarRestaurante.validate(restaurante);

		const existeUsuario = await knex('usuario').where('email', usuario.email).first();

		if (existeUsuario)
			return res.status(400).json('Email já cadastrado');

		const { senha: senhaUsuario, ...dadosUsuario } = usuario;
		const senhaCriptografada = await bcrypt.hash(senhaUsuario, 10);

		const novoUsuario = { ...dadosUsuario, senha: senhaCriptografada }

		const usuarioCadastrado = await knex('usuario').insert(novoUsuario).returning('*');

		if (usuarioCadastrado.length === 0)
			return res.status(400).json('Não foi possível realizar o cadastro do usuario.');

		const { id: usuarioID } = usuarioCadastrado[0];

		const novoRestaurante =
		{
			usuario_id: usuarioID,
			nome: restaurante.nome,
			descricao: restaurante.descricao,
			categoria_id: restaurante.idCategoria,
			taxa_entrega: restaurante.taxaEntrega,
			valor_minimo_pedido: restaurante.valorMinimoPedido,
			tempo_entrega_minutos: restaurante.tempoEntregaEmMinutos
		};

		const restauranteCadastrado = await knex('restaurante').insert(novoRestaurante).returning('*');

		if (restauranteCadastrado.length === 0)
			return res.status(400).json('Não foi possível realizar o cadastro do restaurante.');

		if (restaurante.imagemRestaurante) {
			const caminhoImagem = 'restaurante_' + restauranteCadastrado[0].id.toString() + '/capa.jpg';
			const uploadImage = uploadImagem(restaurante.imagemRestaurante, caminhoImagem);

			if (uploadImage.length === 0)
				return res.status(400).json(uploadImage)
		}
		return res.status(200).json("Usuario cadastrado com sucesso");
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const editarUsuario = async (req, res) => {
	const { authorization } = req.headers;
	const { restaurante: requisicaoRestaurante, ...requisicaoUsuario } = req.body;

	try {
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		if (Object.keys(req.body).length === 0)
			return res.status(400).json("Deve ser preenchida alguma informação para atualizacao");

		await schemaUsuario.editarUsuario.validate(requisicaoUsuario);
		await schemaRestaurante.editarRestaurante.validate(requisicaoRestaurante);

		const usuarioBD = await knex('usuario').where({ id: usuario_id });
		const { senha: senhaBD } = usuarioBD[0];

		if (Object.keys(requisicaoUsuario).length !== 0) {
			let senha = senhaBD;

			if (requisicaoUsuario.senha) {
				const validarSenha = await bcrypt.compare(requisicaoUsuario.senha, senha);

				if (!validarSenha)
					senha = await bcrypt.hash(requisicaoUsuario.senha, 10);
			}

			const atualizarUsuario =
			{
				nome: requisicaoUsuario.nome,
				email: requisicaoUsuario.email,
				senha
			}

			if (atualizarUsuario.length) {
				const usuarioAtualizado = await knex('usuario').where({ id: usuario_id }).update(atualizarUsuario);

				if (usuarioAtualizado.length === 0)
					return res.status(400).json('Erro na atualização do usuario.');
			}
		}

		if (Object.keys(requisicaoRestaurante).length !== 0) {
			const atualizarRestaurante =
			{
				nome: requisicaoRestaurante.nome,
				descricao: requisicaoRestaurante.descricao,
				categoria_id: requisicaoRestaurante.idCategoria,
				taxa_entrega: requisicaoRestaurante.taxaEntrega,
				tempo_entrega_minutos: requisicaoRestaurante.tempoEntregaEmMinutos,
				valor_minimo_pedido: requisicaoRestaurante.valorMinimoPedido
			}

			if (atualizarRestaurante.length) {
				const restauranteAtualizado = await knex('restaurante').where({ id: restaurante_id }).update(atualizarRestaurante);

				if (restauranteAtualizado.length === 0)
					return res.status(400).json('Erro na atualização do restaurante.');
			}

			if (requisicaoRestaurante.imagemRestaurante) {
				const caminhoImagem = 'restaurante_' + restaurante_id + '/capa.jpg';
				const uploadImage = atualizarImagem(requisicaoRestaurante.imagemRestaurante, caminhoImagem);

				if (uploadImage.length === 0)
					return res.status(400).json(uploadImage)
			}
		}

		return res.status(200).json('Atualização concluida com sucesso');
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

module.exports =
{
	cadastrarUsuario,
	editarUsuario
}