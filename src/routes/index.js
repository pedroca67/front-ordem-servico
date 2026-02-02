const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/', async (req, res) => {
    try {
        // 1. Usamos a chave codificada da sessão (Segurança!)
        const auth = api.getAuth(req);

        // 2. Chamamos os endpoints necessários
        // Dica: Usamos o /clientes para o total e o /estatisticas/geral que criamos no Java
        const [resClientes, resStats] = await Promise.all([
            api.get('/clientes', auth),
            api.get('/ordens-servico/estatisticas/geral', auth)
        ]);

        // 3. Pegamos os dados simplificados
        const totalClientes = resClientes.data.length;
        const stats = resStats.data; // { faturamentoTotal, qtdConcluidas, qtdAbertas, qtdGeral }

        // 4. Renderizamos a view com os dados limpos
        res.render('index', { 
            totalClientes, 
            osAbertas: stats.qtdAbertas, 
            faturamento: Number(stats.faturamentoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            papel: req.session.usuarioLogado.papel, 
            usuario: req.session.usuarioLogado.nome, 
            paginaAtual: 'dashboard'
        });

    } catch (error) {
        console.error("Erro ao carregar Dashboard:", error.message);
        
        // Em caso de erro (como sessão expirada), garantimos que a página não quebre
        res.render('index', { 
            totalClientes: 0, 
            osAbertas: 0, 
            faturamento: "0,00",
            papel: req.session.usuarioLogado?.papel || 'USER',
            usuario: req.session.usuarioLogado?.nome || 'Usuário',
            paginaAtual: 'dashboard'
        });
    }
});

module.exports = router;