const express = require('express');
const router = express.Router();
const api = require('../services/api');

// Middleware para simplificar a renderização
const renderNovo = (req, res, dados = {}) => {
    res.render('usuarios/novo', {
        paginaAtual: 'admin',
        erro: dados.erro || null,
        errosCampos: dados.errosCampos || {},
        dadosForm: dados.dadosForm || {},
        usuario: res.locals.usuario,
        papel: res.locals.papel
    });
};

router.get('/novo', (req, res) => renderNovo(req, res));

router.post('/salvar', async (req, res) => {
    try {
        const { username, password, papel } = req.body;
        
        await api.post('/usuarios', { 
            nome: username, 
            username, 
            senha: password, 
            role: papel 
        }, api.getAuth(req));

        res.redirect('/');
    } catch (error) {
        const apiErro = error.response?.data;
        
        renderNovo(req, res, {
            erro: apiErro?.message || "Erro ao processar cadastro",
            errosCampos: apiErro?.errors || {},
            dadosForm: req.body
        });
    }
});

module.exports = router;