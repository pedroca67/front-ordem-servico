const express = require('express');
const router = express.Router();
const api = require('../services/api');

const auth = req => api.getAuth(req);

const viewData = (req, extra = {}) => ({
    usuario: req.session.usuarioLogado?.nome || '',
    papel: req.session.usuarioLogado?.papel || 'USER',
    paginaAtual: 'relatorios',
    ...extra
});

router.get('/', async (req, res) => {
    const { dataInicio, dataFim } = req.query;

    let dados = { total: 0, ordens: [] };

    if (dataInicio && dataFim) {
        try {
            const inicio = `${dataInicio} 00:00:00`;
            const fim = `${dataFim} 23:59:59`;

            const [totalRes, ordensRes] = await Promise.all([
                api.get(`/ordens-servico/relatorios/total-faturado`, {
                    ...auth(req),
                    params: { dataInicio: inicio, dataFim: fim }
                }),
                api.get(`/ordens-servico/relatorios/concluidas-periodo`, {
                    ...auth(req),
                    params: { dataInicio: inicio, dataFim: fim }
                })
            ]);

            dados = {
                total: totalRes.data,
                ordens: ordensRes.data
            };

        } catch (err) {
            console.error('Erro ao buscar relatório:', err.response?.data || err.message);
        }
    }

    res.render('relatorios/index', viewData(req, {
        dados,
        filtros: { dataInicio, dataFim }
    }));
});

module.exports = router;
