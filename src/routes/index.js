const express = require('express');
const router = express.Router();
const api = require('../services/api');

router.get('/', async (req, res) => {
    try {
        // 1. Pegamos as credenciais que salvamos na sessão no momento do login
        const { username, password } = req.session.usuarioLogado;
        
        // 2. Criamos o cabeçalho de autenticação usando a função que criamos no api.js
        const auth = api.getAuthHeader(username, password);

        // 3. Passamos o 'auth' em todas as chamadas GET para o Java autorizar
        const [resClientes, resOS] = await Promise.all([
            api.get('/clientes', auth),
            api.get('/ordens-servico', auth)
        ]);

        const clientes = resClientes.data;
        const ordens = resOS.data;

        const totalClientes = clientes.length;

        const osAbertas = ordens.filter(o => 
            o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA'
        ).length;
        
        const faturamentoTotal = ordens
            .filter(o => o.status === 'CONCLUIDA')
            .reduce((acc, o) => acc + (o.valor || 0), 0);

        // 4. CORREÇÃO DO [object Object]: enviamos req.session.usuarioLogado.dados.nome
        res.render('index', { 
            totalClientes, 
            osAbertas, 
            faturamento: faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            papel: req.session.usuarioLogado.dados.roles[0], 
            usuario: req.session.usuarioLogado.dados.nome, // Enviamos apenas a String com o Nome
            paginaAtual: 'dashboard'
        });

    } catch (error) {
        console.error("Erro ao carregar Dashboard:", error.message);
        res.render('index', { 
            totalClientes: 0, 
            osAbertas: 0, 
            faturamento: "0,00",
            papel: req.session.usuarioLogado ? req.session.usuarioLogado.dados.roles[0] : 'USER',
            usuario: req.session.usuarioLogado ? req.session.usuarioLogado.dados.nome : 'Usuário',
            paginaAtual: 'dashboard'
        });
    }
});

module.exports = router;