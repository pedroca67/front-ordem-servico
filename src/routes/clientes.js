const express = require('express');
const router = express.Router();
const api = require('../services/api');

// LISTAR CLIENTES
router.get('/', async (req, res) => {
    try {
        // Usamos a função centralizada que pega a authKey da sessão
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

// FORMULÁRIO NOVO CLIENTE
router.get('/novo', (req, res) => {
    res.render('clientes/novo', {
        papel: req.session.usuarioLogado.papel,
        usuario: req.session.usuarioLogado.nome,
        paginaAtual: 'clientes',
        erro: null,
        cliente: {} 
    });
});

// PROCESSAR CADASTRO
router.post('/novo', async (req, res) => {
    try {
        const auth = api.getAuth(req);

        const clienteDTO = {
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            telefone: req.body.telefone,
            endereco: req.body.endereco
        };

        await api.post('/clientes', clienteDTO, auth);
        res.redirect('/clientes');
    } catch (error) {
        console.error("Erro ao salvar cliente:", error.response?.data || error.message);
        
        // Verifica se é erro de duplicação (CPF ou Email)
        const msg = error.response?.status === 500 ? "Erro: CPF ou Email já cadastrado." : "Não foi possível salvar o cliente.";

        res.render('clientes/novo', {
            erro: msg,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            cliente: req.body
        });
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

// BUSCA DINÂMICA (Para o modal de Nova OS ou Barra de Pesquisa)
router.get('/api/buscar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const query = req.query.q ? req.query.q.toLowerCase().trim() : '';

        if (!query) return res.json([]);

        // Busca no Spring Boot filtrando por nome
        const response = await api.get(`/clientes/buscar?nome=${encodeURIComponent(query)}`, auth);

        res.json(response.data.slice(0, 10));
    } catch (error) {
        console.error("Erro na busca de clientes:", error.message);
        res.status(500).json([]);
    }
});

module.exports = router;