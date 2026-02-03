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
        await api.post('/clientes', req.body, auth);
        res.redirect('/clientes');
    } catch (error) {
        console.error("Erro ao salvar cliente:", error.response?.data || error.message);
        
        // Captura a mensagem principal e os erros específicos por campo
        const apiErro = error.response?.data;
        const msg = apiErro?.status === 409 ? apiErro.message : "Não foi possível salvar o cliente.";
        const errosCampos = apiErro?.errors || {}; // Pega a lista do Java: { telefone: "...", cpf: "..." }

        res.render('clientes/novo', {
            erro: msg,
            errosCampos: errosCampos, // Enviando os detalhes para a tela
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            cliente: req.body,
            editando: false
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

// EXIBIR FORMULÁRIO DE EDIÇÃO
router.get('/:id/editar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        // Busca o cliente específico pelo ID no Java
        const response = await api.get(`/clientes/${req.params.id}`, auth);
        const clienteEncontrado = response.data;

        res.render('clientes/novo', { 
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            erro: null,
            cliente: clienteEncontrado, 
            editando: true // Bandeira para mudar o título na view
        });
    } catch (error) {
        console.error("Erro ao buscar cliente para edição:", error.message);
        res.redirect('/clientes');
    }
});

// PROCESSAR A ATUALIZAÇÃO
router.post('/:id/editar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        await api.put(`/clientes/${req.params.id}`, req.body, auth);
        res.redirect('/clientes');
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error.response?.data || error.message);
        
        const apiErro = error.response?.data;
        const errosCampos = apiErro?.errors || {};

        res.render('clientes/novo', {
            erro: "Erro ao salvar alterações. Verifique os campos abaixo.",
            errosCampos: errosCampos,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            cliente: { ...req.body, id: req.params.id },
            editando: true
        });
    }
});
// Adicione esta rota ao seu arquivo para testar a busca
router.get('/api/buscar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const termo = req.query.q || '';
        
        // Chamada para o Java (Spring Boot)
        // O Java espera /api/clientes/buscar?nome=...
        const response = await api.get(`/clientes/buscar?nome=${encodeURIComponent(termo)}`, auth);
        
        res.json(response.data);
    } catch (error) {
        console.error("Erro na API Java:", error.response?.data || error.message);
        res.status(500).json([]);
    }
});

module.exports = router;

module.exports = router;