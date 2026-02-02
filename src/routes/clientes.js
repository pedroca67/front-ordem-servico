const express = require('express');
const router = express.Router();
const api = require('../services/api');

// LISTAR CLIENTES
router.get('/', async (req, res) => {
    try {
        // 1. Pegar credenciais da sessão
        const { username, password } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(username, password);

        // 2. Enviar o auth no pedido para o Java
        const response = await api.get('/clientes', auth);
        
        const listaClientes = Array.isArray(response.data) ? response.data : [];

        res.render('clientes/index', { 
            clientes: listaClientes,
            papel: req.session.usuarioLogado.dados.roles[0],
            usuario: req.session.usuarioLogado.dados.nome, 
            paginaAtual: 'clientes' 
        });
    } catch (error) {
        console.error("Erro ao listar clientes:", error.message);
        res.render('clientes/index', { 
            clientes: [], 
            papel: req.session.usuarioLogado ? req.session.usuarioLogado.dados.roles[0] : 'USER', 
            usuario: req.session.usuarioLogado ? req.session.usuarioLogado.dados.nome : 'Erro', 
            paginaAtual: 'clientes' 
        });
    }
});

// FORMULÁRIO NOVO
router.get('/novo', (req, res) => {
    res.render('clientes/novo', { 
        papel: req.session.usuarioLogado.dados.roles[0], 
        usuario: req.session.usuarioLogado.dados.nome, 
        paginaAtual: 'clientes' 
    });
});

// PROCESSAR CADASTRO
router.post('/novo', async (req, res) => {
    try {
        const { username, password } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(username, password);

        await api.post('/clientes', req.body, auth);
        res.redirect('/clientes');
    } catch (error) {
        console.error("Erro ao salvar cliente:", error.message);
        res.status(500).send("Erro ao salvar cliente.");
    }
});

// EXCLUIR CLIENTE
router.get('/:id/excluir', async (req, res) => {
    try {
        const { username, password } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(username, password);

        await api.delete(`/clientes/${req.params.id}`, auth);
        res.redirect('/clientes');
    } catch (error) {
        console.error("Erro ao excluir cliente:", error.message);
        res.status(500).send("Não foi possível excluir o cliente.");
    }
});

// FORMULÁRIO DE EDIÇÃO
router.get('/:id/editar', async (req, res) => {
    try {
        const { username, password } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(username, password);

        const response = await api.get(`/clientes/${req.params.id}`, auth);
        res.render('clientes/editar', { 
            cliente: response.data,
            papel: req.session.usuarioLogado.dados.roles[0],
            usuario: req.session.usuarioLogado.dados.nome, 
            paginaAtual: 'clientes' 
        });
    } catch (error) {
        res.redirect('/clientes');
    }
});

// PROCESSAR EDIÇÃO
router.post('/:id/editar', async (req, res) => {
    try {
        const { username, password } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(username, password);

        await api.put(`/clientes/${req.params.id}`, req.body, auth);
        res.redirect('/clientes');
    } catch (error) {
        res.status(500).send("Erro ao atualizar cliente.");
    }
});

// BUSCA DINÂMICA (Utilizada em modais de OS)
router.get('/api/buscar', async (req, res) => {
    try {
        const { username, password } = req.session.usuarioLogado;
        const auth = api.getAuthHeader(username, password);
        
        const query = req.query.q.toLowerCase();
        const response = await api.get('/clientes', auth);
        
        const filtrados = response.data.filter(c => 
            c.nome.toLowerCase().includes(query) || 
            c.cpf.includes(query)
        ).slice(0, 10);
        
        res.json(filtrados);
    } catch (error) {
        res.status(500).json([]);
    }
});

module.exports = router;