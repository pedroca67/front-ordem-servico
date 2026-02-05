const express = require('express');
const router = express.Router(); //rota de home
const api = require('../services/api');

const auth = req => api.getAuth(req); // Função helper: pega auth da sessão

const viewData = (req, extra = {}) => ({// Função helper para montar dados padrão da view
    papel: req.session.usuarioLogado?.papel || 'USER', //papel do usuário (com fallback)
    usuario: req.session.usuarioLogado?.nome || 'Usuário', //nome do usuario
    paginaAtual: 'dashboard',
    ...extra
});

router.get('/', async (req, res) => {
    try {
        const [clientesRes, statsRes] = await Promise.all([ // Promise.all executa as duas chamadas ao mesmo tempo
            api.get('/clientes', auth(req)), // Busca lista de clientes
            api.get('/ordens-servico/estatisticas/geral', auth(req))  // Busca estatísticas das OS
        ]);

        const totalClientes = clientesRes.data?.length || 0; // Conta quantidade de clientes
        const stats = statsRes.data || {}; // Dados das estatísticas

        res.render('index', viewData(req, { // Renderiza index.ejs com dados padrão + extras
            totalClientes, osAbertas: stats.qtdAbertas || 0,

            
            faturamento: Number(stats.faturamentoTotal || 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 }) //limitar a 2 digitos depois da , .
        }));

    } catch (err) {
        console.error('Erro ao carregar dashboard:', err.message);
        //se der erro renderiza tudo zerado
        res.render('index', viewData(req, {
            totalClientes: 0,
            osAbertas: 0,
            faturamento: '0,00'
        }));
    }
});

module.exports = router;
