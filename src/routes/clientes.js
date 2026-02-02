const express = require('express');
const router = express.Router();
const api = require('../services/api');

// LISTAR CLIENTES
router.get('/', async (req, res) => {
    try {
        // Agora usamos apenas o objeto de autenticação centralizado
        const auth = api.getAuth(req);

        const response = await api.get('/clientes', auth);
        const listaClientes = Array.isArray(response.data) ? response.data : [];

        res.render('clientes/index', { 
            clientes: listaClientes,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome, 
            paginaAtual: 'clientes' 
        });
    } catch (error) {
        console.error("Erro ao listar clientes:", error.message);
        res.render('clientes/index', { 
            clientes: [], 
            papel: req.session.usuarioLogado?.papel || 'USER', 
            usuario: req.session.usuarioLogado?.nome || 'Erro', 
            paginaAtual: 'clientes' 
        });
    }
});

// FORMULÁRIO NOVO
router.get('/novo', (req, res) => {
    res.render('clientes/novo', { 
        papel: req.session.usuarioLogado.papel, 
        usuario: req.session.usuarioLogado.nome, 
        paginaAtual: 'clientes' 
    });
});

// PROCESSAR CADASTRO
router.post('/novo', async (req, res) => {
    try {
        const auth = api.getAuth(req);
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
        const auth = api.getAuth(req);
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
        const auth = api.getAuth(req);
        const response = await api.get(`/clientes/${req.params.id}`, auth);
        res.render('clientes/editar', { 
            cliente: response.data,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome, 
            paginaAtual: 'clientes' 
        });
    } catch (error) {
        res.redirect('/clientes');
    }
});

// PROCESSAR EDIÇÃO
router.post('/:id/editar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        await api.put(`/clientes/${req.params.id}`, req.body, auth);
        res.redirect('/clientes');
    } catch (error) {
        res.status(500).send("Erro ao atualizar cliente.");
    }
});

// BUSCA DINÂMICA
router.get('/api/buscar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
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