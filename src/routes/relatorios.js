const express = require('express');
// Importa Express

const router = express.Router();
// Cria Router para as rotas de relatórios

const api = require('../services/api');
// Service que faz requisições ao backend

// Helper para pegar a autenticação da sessão
const auth = req => api.getAuth(req);

// Helper para enviar dados padrão para a view
const viewData = (req, extra = {}) => ({
    usuario: req.session.usuarioLogado?.nome || '',  // Nome do usuário logado
    papel: req.session.usuarioLogado?.papel || 'USER', // Papel do usuário
    paginaAtual: 'relatorios',                        // Página atual (menu ativo)
    ...extra                                         // Junta dados extras específicos da tela
});


// ================= LISTAGEM DE RELATÓRIOS =================
router.get('/', async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    // Recebe filtros de datas do frontend

    let dados = { total: 0, ordens: [] };
    // Inicializa objeto de retorno com valores padrão

    if (dataInicio && dataFim) {
        // Só busca no backend se as duas datas estiverem preenchidas
        try {
            const inicio = `${dataInicio} 00:00:00`;
            const fim = `${dataFim} 23:59:59`;
            // Ajusta as datas para pegar o dia inteiro

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
            // Chama duas APIs ao mesmo tempo:
            // total faturado no período
            //ordens concluídas no período

            dados = {
                total: totalRes.data,
                ordens: ordensRes.data
            };
            // Guarda os dados recebidos do backend
        } catch (err) {
            console.error('Erro ao buscar relatório:', err.response?.data || err.message);
            // Se der erro, mantém dados zerados e registra no console
        }
    }

    // Renderiza a view relatorios/index.ejs
    res.render('relatorios/index', viewData(req, { 
                                  // Dados do relatório
       dados, filtros: { dataInicio, dataFim } // Mantém os filtros preenchidos na tela
    }));
});

module.exports = router;
// Exporta as rotas de relatórios
