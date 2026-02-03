const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/login', (_, res) => res.render('auth/login')); //ao acessar login, renderiza login.ejs

router.post('/login', async (req, res) => { //formulario post
    const { username, password } = req.body; //recebe o usuario e senha

    try { //Cria Basic Auth
        const authKey = Buffer.from(`${username}:${password}`).toString('base64');
        //converte "usuario:senha" em base64 (Basic Auth)

        const { data: usuarios } = await api.get('/usuarios', { 
            headers: { Authorization: `Basic ${authKey}` }
        }); 
        // Busca usuários na API usando autenticação

        const usuario = usuarios.find(u => u.username === username); // Procura o usuário digitado na lista

        if (!usuario) throw new Error(); //Se não encontrar, dispara erro

        //else{
        req.session.authKey = authKey; //salva chave de autenticação na sessão

        req.session.usuarioLogado = { //salva nome e perfil do usuário na sessão
            nome: usuario.nome,
            papel: usuario.role ?? usuario.roles?.[0] ?? 'USER'
        };

        req.session.save(() => res.redirect('/')); //Garante que salvou sessão e redireciona para home


    } catch {
        res.render('auth/login', { erro: 'Usuário ou senha inválidos' });
        //se der erro, volta pro login com mensagem
    }
});

router.get('/logout', (req, res) => { // Rota get para sair do sistema
    req.session.destroy(() => res.redirect('/login'));// Destroi/apaga a sessão e volta para login
});

module.exports = router; // Exporta as rotas para o app.js
