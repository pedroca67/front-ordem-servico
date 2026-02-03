const express = require('express');
const router = express.Router();
const api = require('../services/api');

// Exibe o formulário de cadastro
router.get('/novo', (req, res) => {
    res.render('usuarios/novo', {
        paginaAtual: 'admin',
        erro: null,
        errosCampos: {},
        dadosForm: {},
        usuario: res.locals.usuario,
        papel: res.locals.papel
    });
});

// PROCESSAR O CADASTRO
router.post('/salvar', async (req, res) => {
    try {
        const auth = api.getAuth(req);

        const novoUsuario = {
            nome: req.body.username,
            username: req.body.username,
            senha: req.body.password,
            role: req.body.papel
        };

        await api.post('/usuarios', novoUsuario, auth);

        // Sucesso
        return res.redirect('/');

    } catch (error) {
        console.error("Erro ao criar usuário:", error.response?.data || error.message);

        const apiErro = error.response?.data;
        let msgErro = "Verifique os dados informados abaixo.";
        let errosCampos = {};

        if (apiErro) {
            // PRIORIDADE 1: mensagem direta do backend (ex: 409 usuário já existe)
            if (apiErro.message) {
                msgErro = apiErro.message;
            }

            // PRIORIDADE 2: erros de validação (400)
            if (apiErro.errors) {
                errosCampos = apiErro.errors;
            }
        }

        return res.render('usuarios/novo', {
            erro: msgErro,
            errosCampos: errosCampos,
            paginaAtual: 'admin',
            dadosForm: req.body,
            usuario: res.locals.usuario,
            papel: res.locals.papel
        });
    }
});

module.exports = router;
