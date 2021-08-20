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

module.exports =
{
	fazerLogin
}