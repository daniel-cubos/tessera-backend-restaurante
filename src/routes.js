const express = require('express');
const filtroLogin = require('./filtros/filtroLogin');

const crudUsuario = require('./controladores/usuario/usuarioCrud');
const crudProduto = require('./controladores/produtos/produtosCrud');
const funcionalidadeUsuario = require('./controladores/usuario/usuarioFuncionalidades');
const funcionalidadeProduto = require('./controladores/produtos/produtosFuncionalidades');

const router = express();

router.post('/login', funcionalidadeUsuario.fazerLogin);
router.post('/usuarios', crudUsuario.cadastrarUsuario);
router.put('/usuarios', filtroLogin, crudUsuario.editarUsuario);
router.get('/usuarios', filtroLogin, crudUsuario.visualizarUsuario);

router.get('/produtos', filtroLogin, crudProduto.consultarProdutos);
router.get('/produtos/:id', filtroLogin, crudProduto.consultarProdutos);
router.put('/produtos/:id', filtroLogin, crudProduto.editarProdutos);
router.post('/produtos', filtroLogin, crudProduto.cadastrarProdutos);
router.delete('/produtos/:id', filtroLogin, crudProduto.deletarProdutos);
router.post('/produtos/:id/ativar', filtroLogin, funcionalidadeProduto.ativarProduto);
router.post('/produtos/:id/desativar', filtroLogin, funcionalidadeProduto.desativarProduto);

//---------------------------------- Rotas de Desenvolvimento --------------------------------\\

const cetegoria = require('./controladores/categoria/categoriaCRUD');

router.get('/categoria', cetegoria.consultarCategoria);
router.get('/categoria/:id', cetegoria.consultarCategoria);
router.put('/categoria/:id', cetegoria.editarCategoria);
router.post('/categoria', cetegoria.cadastrarCategoria);
router.delete('/categoria/:id', cetegoria.deletarCategoria);

module.exports = router;