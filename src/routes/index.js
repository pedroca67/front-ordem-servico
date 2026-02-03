const express = require('express');
const router = express.Router();
const api = require('../services/api');

const auth = req => api.getAuth(req);

const viewData = (req, extra = {}) => ({
    papel: req.session.usuarioLogado?.papel || 'USER',
    usuario: req.session.usuarioLogado?.nome || 'Usuário',
    paginaAtual: 'dashboard',
    ...extra
});

router.get('/', async (req, res) => {
    try {
        const [clientesRes, statsRes] = await Promise.all([
            api.get('/clientes', auth(req)),
            api.get('/ordens-servico/estatisticas/geral', auth(req))
        ]);

        const totalClientes = clientesRes.data?.length || 0;
        const stats = statsRes.data || {};

        res.render('index', viewData(req, {
            totalClientes,
            osAbertas: stats.qtdAbertas || 0,
            faturamento: Number(stats.faturamentoTotal || 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        }));

    } catch (err) {
        console.error('Erro ao carregar dashboard:', err.message);

        res.render('index', viewData(req, {
            totalClientes: 0,
            osAbertas: 0,
            faturamento: '0,00'
        }));
    }
});

module.exports = router;
