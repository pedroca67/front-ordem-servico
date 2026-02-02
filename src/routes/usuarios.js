const express = require('express');
const router = express.Router();
const api = require('../services/api');

// Rota de Processamento de Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Criamos a chave Base64 na hora para testar o login no Java
        const authKey = Buffer.from(`${username}:${password}`).toString('base64');
        const auth = { headers: { 'Authorization': `Basic ${authKey}` } };

        // 2. Chamamos o Java para validar (Ex: um endpoint que retorna dados do user)
        const response = await api.get(`/usuarios/me`, auth);

        // 3. SE O LOGIN FOR SUCESSO:
        // Guardamos a chave de autorização e os dados básicos (SEM A SENHA)
        req.session.authKey = authKey;
        req.session.usuarioLogado = {
            nome: response.data.nome,
            papel: response.data.role || response.data.papel // ajuste conforme seu DTO no Java
        };

        res.redirect('/dashboard');

    } catch (error) {
        console.error("Erro no login:", error.message);
        res.render('login', { erro: "Usuário ou senha inválidos." });
    }
});

// Logout Seguro
router.get('/logout', (req, res) => {
    req.session.destroy(); // Mata a sessão e a authKey junto
    res.redirect('/login');
});

module.exports = router;