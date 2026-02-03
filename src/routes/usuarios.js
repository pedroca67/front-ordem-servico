const express = require('express');
const router = express.Router();
const api = require('../services/api');

const auth = req => api.getAuth(req);

// Helper de render
const renderNovo = (res, extra = {}) => {
    res.render('usuarios/novo', {
        paginaAtual: 'admin',
        erro: null,
        errosCampos: {},
        dadosForm: {},
        usuario: res.locals.usuario,
        papel: res.locals.papel,
        ...extra
    });
};

router.get('/novo', (_, res) => renderNovo(res));

router.post('/salvar', async (req, res) => {
    try {
        const { username, password, papel } = req.body;

        await api.post('/usuarios', {
            nome: username,
            username,
            senha: password,
            role: papel
        }, auth(req));

        res.redirect('/');

    } catch (err) {
        const apiErro = err.response?.data;

        renderNovo(res, {
            erro: apiErro?.message || 'Erro ao processar cadastro',
            errosCampos: apiErro?.errors || {},
            dadosForm: req.body
        });
    }
});

module.exports = router;
