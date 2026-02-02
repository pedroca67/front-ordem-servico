const express = require('express');
const router = express.Router();
const api = require('../services/api');

// Exibe o formulário de cadastro
router.get('/novo', (req, res) => {
    res.render('usuarios/novo', { 
        paginaAtual: 'admin',
        erro: null,
        // Passamos os dados do locals para a view caso precise
        usuario: res.locals.usuario,
        papel: res.locals.papel
    });
});

// Processa o salvamento no Spring Boot
router.post('/salvar', async (req, res) => {
    try {
        // 1. Usamos a função centralizada para pegar a autorização (Basic Auth em Base64)
        const auth = api.getAuth(req);

        // 2. Montamos o objeto exatamente como o seu Controller no Java espera
        const usuarioDTO = {
            nome: req.body.username, // Usando o username como nome por enquanto
            username: req.body.username,
            senha: req.body.password, // Campo que o Java vai encriptar com BCrypt
            role: req.body.papel      // Vem do <select name="papel"> no seu HTML
        };

        // 3. Enviamos para o Java passando o objeto de configuração 'auth'
        await api.post('/usuarios', usuarioDTO, auth);

        // Sucesso: volta para a home
        res.redirect('/'); 

    } catch (error) {
        console.error("Erro ao criar usuário:", error.message);
        
        // Se o erro for 401, é porque a sessão expirou ou o usuário não é ADMIN
        const mensagemErro = error.response?.status === 401 
            ? "Sessão expirada ou você não tem permissão de Administrador." 
            : "Erro ao criar usuário. Verifique se o login já existe.";

        res.render('usuarios/novo', {
            erro: mensagemErro,
            paginaAtual: 'admin',
            usuario: res.locals.usuario,
            papel: res.locals.papel
        });
    }
});

module.exports = router;