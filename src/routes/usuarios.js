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

router.get('/novo', (_, res) => renderNovo(res)); // Apenas renderiza o formulário vazio

router.post('/salvar', async (req, res) => {
    try {
        const { username, password, papel } = req.body;
        // Pega dados do formulário

        await api.post('/usuarios', {
            nome: username,
            username,
            senha: password,
            role: papel
        }, auth(req));
        // Chama o backend para criar o usuário

        res.redirect('/');
        // Se sucesso, volta pra home

    } catch (err) {
        const apiErro = err.response?.data;
        // Captura mensagem de erro retornada pelo backend

        renderNovo(res, {
            erro: apiErro?.message || 'Erro ao processar cadastro',
            errosCampos: apiErro?.errors || {}, // Erros específicos de campos (ex: senha fraca)
            dadosForm: req.body                  // Mantém dados preenchidos pelo usuário
        });
        // Re-renderiza o formulário com mensagens de erro
    }
});


module.exports = router;

module.exports = router;
