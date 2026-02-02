const express = require('express');
const router = express.Router();
const api = require('../services/api');

// Exibe o formulário (apenas para ADMIN)
router.get('/novo', (req, res) => {
    res.render('usuarios/novo', { 
        paginaAtual: 'admin' // Para destacar o menu em amarelo
    });
});

// Processa o salvamento no Java
router.post('/salvar', async (req, res) => {
    try {
        const { username, password, papel } = req.body;
        const { username: admUser, password: admPass } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(admUser, admPass);

        const usuarioDTO = {
            nome: username,
            username: username,
            senha: password,
            role: papel 
        };

        await api.post('/usuarios', usuarioDTO, auth);
        res.redirect('/'); 

    } catch (error) {
        console.error("Erro ao criar usuário:", error.message);

        res.render('usuarios/novo', { 
            erro: "Não foi possível criar o usuário.",
            paginaAtual: 'admin',
            usuario: req.session.usuarioLogado.dados.nome,
            papel: req.session.usuarioLogado.dados.roles[0]
        });
    }
});

module.exports = router;