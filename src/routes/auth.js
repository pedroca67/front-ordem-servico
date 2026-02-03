const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/login', (_, res) => res.render('auth/login'));

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const authKey = Buffer.from(`${username}:${password}`).toString('base64');

        const { data: usuarios } = await api.get('/usuarios', {
            headers: { Authorization: `Basic ${authKey}` }
        });

        const usuario = usuarios.find(u => u.username === username);
        if (!usuario) throw new Error();

        req.session.authKey = authKey;
        req.session.usuarioLogado = {
            nome: usuario.nome,
            papel: usuario.role ?? usuario.roles?.[0] ?? 'USER'
        };

        req.session.save(() => res.redirect('/'));

    } catch {
        res.render('auth/login', { erro: 'Usuário ou senha inválidos' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
