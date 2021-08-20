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
        .min(6)
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
        .min(6)
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