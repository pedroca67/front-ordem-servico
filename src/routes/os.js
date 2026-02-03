const express = require('express');
const router = express.Router();
const api = require('../services/api');

const auth = req => api.getAuth(req);

const viewData = (req, extra = {}) => ({
    papel: req.session.usuarioLogado?.papel || 'USER',
    usuario: req.session.usuarioLogado?.nome || '',
    paginaAtual: 'os',
    ...extra
});

// LISTAGEM
router.get('/', async (req, res) => {
    try {
        const { data = [] } = await api.get('/ordens-servico', auth(req));
        res.render('os/index', viewData(req, { ordens: data }));
    } catch {
        res.render('os/index', viewData(req, { ordens: [] }));
    }
});

// NOVA (FORM)
router.get('/nova', async (req, res) => {
    try {
        const { data } = await api.get('/clientes', auth(req));
        res.render('os/nova', viewData(req, { clientes: data }));
    } catch {
        res.redirect('/os');
    }
});

// CRIAR
router.post('/nova', async (req, res) => {
    try {
        await api.post('/ordens-servico', {
            descricaoProblema: req.body.descricaoProblema,
            observacoes: req.body.observacoes || '',
            valor: req.body.valorOrcamento,
            status: req.body.status || 'ABERTA',
            clienteId: req.body.clienteId
        }, auth(req));

        res.redirect('/os');
    } catch {
        res.status(500).send('Erro ao salvar OS');
    }
});

// DETALHES
router.get('/:id', async (req, res) => {
    try {
        const { data } = await api.get(`/ordens-servico/${req.params.id}`, auth(req));
        res.render('os/detalhes', viewData(req, { ordem: data }));
    } catch {
        res.redirect('/os');
    }
});

// ATUALIZAR STATUS
router.post('/:id/status', async (req, res) => {
    try {
        await api.put(`/ordens-servico/${req.params.id}/status`,
            { status: req.body.status },
            auth(req)
        );

    } finally {
        res.redirect(`/os/${req.params.id}`);
    }
});

// EXCLUIR
router.post('/:id/excluir', async (req, res) => {
    try {
        await api.delete(`/ordens-servico/${req.params.id}`, auth(req));
        res.redirect('/os');
    } catch {
        res.status(500).send('Erro ao excluir a ordem.');
    }
});

// EDITAR (FORM)
router.get('/:id/editar', async (req, res) => {
    try {
        const { data: ordem } = await api.get(`/ordens-servico/${req.params.id}`, auth(req));

        if (ordem.status === 'CONCLUIDA') return res.redirect(`/os/${ordem.id}`);

        res.render('os/editar', viewData(req, { ordem }));
    } catch {
        res.redirect('/os');
    }
});

// EDITAR (POST)
router.post('/:id/editar', async (req, res) => {
    try {
        await api.put(`/ordens-servico/${req.params.id}`, {
            descricaoProblema: req.body.descricaoProblema,
            observacoes: req.body.observacoes,
            valor: Number(req.body.valor),
            status: req.body.status,
            clienteId: Number(req.body.clienteId)
        }, auth(req));

        res.redirect(`/os/${req.params.id}`);
    } catch {
        res.status(500).send('Erro ao atualizar os dados.');
    }
});

module.exports = router;
