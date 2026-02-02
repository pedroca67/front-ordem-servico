const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Geramos a chave Base64 temporária para validar o login no Java
        const authKey = Buffer.from(`${username}:${password}`).toString('base64');
        const auth = { headers: { 'Authorization': `Basic ${authKey}` } };

        // 2. Buscamos a lista de usuários para encontrar os dados de quem está logando
        const response = await api.get('/usuarios', auth);
        const usuarioEncontrado = response.data.find(u => u.username === username);

        if (!usuarioEncontrado) {
            throw new Error("Usuário não encontrado na base de dados.");
        }

        // 3. SEGURANÇA: Salvamos a chave e os dados, mas NUNCA a senha em texto puro
        req.session.authKey = authKey;
        req.session.usuarioLogado = {
            nome: usuarioEncontrado.nome,
            papel: usuarioEncontrado.role || (usuarioEncontrado.roles ? usuarioEncontrado.roles[0] : 'USER')
        };

        // Salva a sessão manualmente antes de redirecionar para evitar bugs de sincronia
        req.session.save(() => {
            res.redirect('/');
        });

    } catch (error) {
        console.error("Erro no login:", error.message);
        res.render('auth/login', { erro: "Usuário ou senha inválidos" });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;