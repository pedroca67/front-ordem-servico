const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Tentamos buscar os dados do próprio usuário para validar a senha no Java
        // Passamos o header de auth dinamicamente
        const response = await api.get('/usuarios', api.getAuthHeader(username, password));
        
        // Se chegou aqui, a senha está correta! Salvamos na sessão do Node
        req.session.usuarioLogado = {
            username: username,
            password: password,
            // Aqui você pode filtrar o papel (ADMIN/USER) vindo do Java
            dados: response.data.find(u => u.username === username)
        };

        res.redirect('/');
    } catch (error) {
        res.render('auth/login', { erro: "Usuário ou senha inválidos" });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;