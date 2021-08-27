const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../bancodedados/conexao');
const schema = require('../../validacao/usuarioSchema');
const { uploadImagem, atualizarImagem, pegarUrlImagem } = require('../../supabase');

const cadastrarUsuario = async (req, res) => {
	const { restaurante, ...usuario } = req.body;

	try {
		await schema.cadastrarUsuario.validate(req.body);

		const existeUsuario = await knex('usuario').where('email', usuario.email).first();

		if (existeUsuario)
			return res.status(400).json('Email já cadastrado');

		const { senha: senhaUsuario, ...dadosUsuario } = usuario;
		const senhaCriptografada = await bcrypt.hash(senhaUsuario, 10);

		const novoUsuario = { ...dadosUsuario, senha: senhaCriptografada }

		const usuarioCadastrado = await knex('usuario').insert(novoUsuario).returning('*');

		if (usuarioCadastrado.length === 0)
			return res.status(400).json('Não foi possível realizar o cadastro do usuario.');

		const { id: usuario_id } = usuarioCadastrado[0];

		const novoRestaurante =
		{
			usuario_id,
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

			const caminhoImagem = 'restaurante_' + restauranteCadastrado[0].id.toString() + '/imagem_restaurante.jpg';
			const uploadImage = uploadImagem(restaurante.imagemRestaurante, caminhoImagem);

			if (uploadImage.length === 0)
				return res.status(400).json(uploadImage);

			const urlImagem = await pegarUrlImagem(caminhoImagem);
			const urlCadastrada = await knex('restaurante').where({ id: restauranteCadastrado[0].id }).update({ img_restaurante: urlImagem });

			if (urlCadastrada.length === 0)
				return res.status(400).json('Não foi possível realizar o cadastro da imagem do restaurante.');
		}
		return res.status(200).json("Usuario cadastrado com sucesso");
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const editarUsuario = async (req, res) => {
	const { authorization } = req.headers;
	const { restaurante: updateRestaurante, ...updateUsuario } = req.body;

	try {
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);
		const { id: restaurante_id } = await knex('restaurante').where({ usuario_id }).first();

		await schema.editarUsuario.validate(req.body);

		const usuarioBD = await knex('usuario').where({ id: usuario_id });
		const { senha: senhaBD } = usuarioBD[0];

		if (Object.keys(updateUsuario).length !== 0) {
			let senha = senhaBD;

			if (updateUsuario.senha) {
				const validarSenha = await bcrypt.compare(updateUsuario.senha, senha);

				if (!validarSenha)
					senha = await bcrypt.hash(updateUsuario.senha, 10);
			}

			const atualizarUsuario =
			{
				nome: updateUsuario.nome,
				email: updateUsuario.email,
				senha
			}

			if (Object.keys(updateUsuario).length) {
				const usuarioAtualizado = await knex('usuario').where({ id: usuario_id }).update(atualizarUsuario);

				if (usuarioAtualizado.length === 0)
					return res.status(400).json('Erro na atualização do usuario.');
			}
		}

		if (Object.keys(updateRestaurante).length !== 0) {
			let urlImagem;
			if (updateRestaurante.imagemRestaurante) {
				const caminhoImagem = 'restaurante_' + restaurante_id + '/imagem_restaurante.jpg';
				const uploadImage = await atualizarImagem(updateRestaurante.imagemRestaurante, caminhoImagem);

				if (uploadImage.length === 0)
					return res.status(400).json(uploadImage)

				urlImagem = await pegarUrlImagem(caminhoImagem);
			}

			const atualizarRestaurante =
			{
				nome: updateRestaurante.nome,
				descricao: updateRestaurante.descricao,
				categoria_id: updateRestaurante.idCategoria,
				taxa_entrega: updateRestaurante.taxaEntrega,
				tempo_entrega_minutos: updateRestaurante.tempoEntregaEmMinutos,
				valor_minimo_pedido: updateRestaurante.valorMinimoPedido,
				img_restaurante: urlImagem
			}

			if (Object.keys(atualizarRestaurante).length !== 0) {
				const restauranteAtualizado = await knex('restaurante').where({ id: restaurante_id }).update(atualizarRestaurante);

				if (restauranteAtualizado.length === 0)
					return res.status(400).json('Erro na atualização do restaurante.');
			}
		}
		return res.status(200).json('Atualização concluida com sucesso');
	}
	catch (error) {
		return res.status(400).json(error.message);
	}
}

const visualizarUsuario = async (req, res) => {
	const { authorization } = req.headers;

	try {
		const { id: usuario_id } = jwt.verify(authorization, process.env.SENHA_JWT);

		const usuario = await knex('usuario').where({ id: usuario_id }).first()
		const restaurante = await knex('restaurante').where({ usuario_id }).first();

		const info = {
			usuarioId: usuario.id,
			nomeUsuario: usuario.nome,
			email: usuario.email,

			restauranteId: restaurante.id,
			nomeRestaurante: restaurante.nome,
			descricaoRestaurante: restaurante.descricao,
			taxaEntrega: restaurante.taxa_entrega,
			valorMinimoPedido: restaurante.valor_minimo_pedido,
			tempoEntregaEmMinutos: restaurante.tempo_entrega_minutos,
			imagemRestaurante: restaurante.img_restaurante
		}
		return res.json(info)
	} catch (error) {
		return res.status(400).json(error.message);
	}
}

module.exports =
{
	cadastrarUsuario,
	editarUsuario,
	visualizarUsuario
}