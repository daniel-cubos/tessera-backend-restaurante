const yup = require('./config');

const cadastrarUsuario = yup.object().shape({
	nome: yup
		.string()
		.max(100)
		.required(),

	email: yup
		.string()
		.email()
		.max(100)
		.required(),

	senha: yup
		.string()
		.required()
		.min(6),

	restaurante: yup.object().required().shape({
		nome: yup
			.string()
			.max(50)
			.required(),

		descricao: yup
			.string()
			.max(100),

		idCategoria: yup
			.number()
			.required()
			.min(1),

		taxaEntrega: yup
			.number()
			.min(0),

		tempoEntregaEmMinutos: yup
			.number()
			.required(),

		valorMinimoPedido: yup
			.number()
			.required()
			.min(0)
	})
});

const editarUsuario = yup.object().shape({
	nome: yup
		.string()
		.max(100),

	email: yup
		.string()
		.email()
		.max(100),

	senha: yup
		.string()
		.min(6),

	restaurante: yup.object().shape({
		nome: yup
			.string()
			.max(50),

		descricao: yup
			.string()
			.max(100),

		idCategoria: yup
			.number()
			.min(1),

		taxaEntrega: yup
			.number()
			.min(0),

		tempoEntregaEmMinutos: yup
			.number(),

		valorMinimoPedido: yup
			.number()
			.min(0)
	})
});

const loginUsuario = yup.object().shape({
	email: yup
		.string()
		.email()
		.required()
		.max(100),

	senha: yup
		.string()
		.required()
});

module.exports =
{
	cadastrarUsuario,
	editarUsuario,
	loginUsuario
};