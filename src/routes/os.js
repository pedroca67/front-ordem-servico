const express = require('express');
const router = express.Router();
const api = require('../services/api');

// LISTAGEM DE OS
router.get('/', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const response = await api.get('/ordens-servico', auth);
        
        res.render('os/index', { 
            ordens: response.data,
            papel: req.session.usuarioLogado.papel, 
            usuario: req.session.usuarioLogado.nome, 
            paginaAtual: 'os' 
        });
    } catch (error) {
        console.error("Erro ao buscar OS:", error.message);
        res.render('os/index', { 
            ordens: [], 
            papel: req.session.usuarioLogado?.papel || 'USER', 
            usuario: req.session.usuarioLogado?.nome || 'Erro', 
            paginaAtual: 'os' 
        });
    }
});

// TELA DE NOVA OS
router.get('/nova', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const response = await api.get('/clientes', auth);
        
        res.render('os/nova', { 
            clientes: response.data,
            papel: req.session.usuarioLogado.papel, 
            usuario: req.session.usuarioLogado.nome, 
            paginaAtual: 'os' 
        });
    } catch (error) {
        res.redirect('/os');
    }
});

// PROCESSAR SALVAMENTO
router.post('/nova', async (req, res) => {
    try {
        const auth = api.getAuth(req);

        const novaOS = {
            descricaoProblema: req.body.descricaoProblema,
            observacoes: req.body.observacoes || "",
            valor: req.body.valorOrcamento,
            status: req.body.status || "ABERTA",
            clienteId: req.body.clienteId
        };

        await api.post('/ordens-servico', novaOS, auth);
        res.redirect('/os');
    } catch (error) {
        console.error("Erro ao salvar OS:", error.message);
        res.status(500).send("Erro ao salvar OS");
    }
});

// EXIBIR DETALHES DE UMA OS
router.get('/:id', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const response = await api.get(`/ordens-servico/${req.params.id}`, auth);
        
        res.render('os/detalhes', { 
            ordem: response.data,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'os'
        });
    } catch (error) {
        res.redirect('/os');
    }
});

// ATUALIZAR STATUS DA OS
router.post('/:id/status', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const { id } = req.params;
        const { status } = req.body;
        
        await api.put(`/ordens-servico/${id}/status`, { status }, auth);
        res.redirect(`/os/${id}`);
    } catch (error) {
        res.redirect(`/os/${req.params.id}`);
    }
});

// EXCLUIR OS
router.post('/:id/excluir', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        await api.delete(`/ordens-servico/${req.params.id}`, auth);
        res.redirect('/os');
    } catch (error) {
        res.status(500).send("Erro ao excluir a ordem.");
    }
});

// EXIBIR FORMULÁRIO DE EDIÇÃO
router.get('/:id/editar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const response = await api.get(`/ordens-servico/${req.params.id}`, auth);
        const ordem = response.data;

        if (ordem.status === 'CONCLUIDA') {
            return res.redirect(`/os/${ordem.id}`);
        }

        res.render('os/editar', { 
            ordem,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'os'
        });
    } catch (error) {
        res.redirect('/os');
    }
});

// PROCESSAR EDIÇÃO
router.post('/:id/editar', async (req, res) => {
    try {
        const auth = api.getAuth(req);

        const dadosParaEnviar = {
            descricaoProblema: req.body.descricaoProblema,
            observacoes: req.body.observacoes,
            valor: parseFloat(req.body.valor),
            status: req.body.status,
            clienteId: parseInt(req.body.clienteId)
        };

        await api.put(`/ordens-servico/${req.params.id}`, dadosParaEnviar, auth);
        res.redirect(`/os/${req.params.id}`);
    } catch (error) {
        res.status(500).send("Erro ao atualizar os dados.");
    }
});

module.exports = router;