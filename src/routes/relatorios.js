const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/', async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    let dadosRelatorio = { total: 0, ordens: [] };

    if (dataInicio && dataFim) {
        try {
            // 1. Usamos a função centralizada para pegar a autorização (authKey)
            const auth = api.getAuth(req);

            // 2. Formatar datas para o padrão do Java: yyyy-MM-dd HH:mm:ss
            const inicio = `${dataInicio} 00:00:00`;
            const fim = `${dataFim} 23:59:59`;

            // 3. Fazer as chamadas passando o objeto 'auth' e codificando a URL
            const [resTotal, resOrdens] = await Promise.all([
                api.get(`/ordens-servico/relatorios/total-faturado?dataInicio=${encodeURIComponent(inicio)}&dataFim=${encodeURIComponent(fim)}`, auth),
                api.get(`/ordens-servico/relatorios/concluidas-periodo?dataInicio=${encodeURIComponent(inicio)}&dataFim=${encodeURIComponent(fim)}`, auth)
            ]);

            dadosRelatorio.total = resTotal.data;
            dadosRelatorio.ordens = resOrdens.data;

            console.log("Relatório gerado com sucesso para o período:", dataInicio, "a", dataFim);

        } catch (error) {
            console.error("Erro ao buscar relatório:", error.response ? error.response.data : error.message);
        }
    }

    // 4. Renderizamos passando os dados simplificados da sessão (nome e papel)
    res.render('relatorios/index', { 
        dados: dadosRelatorio,
        filtros: { dataInicio, dataFim },
        usuario: req.session.usuarioLogado?.nome,
        papel: req.session.usuarioLogado?.papel,
        paginaAtual: 'relatorios'
    });
});

module.exports = router;