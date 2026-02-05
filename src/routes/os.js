const express = require('express');
const router = express.Router();
const api = require('../services/api');

const auth = req => api.getAuth(req);

// Helper para enviar dados padrão pra views
const viewData = (req, extra = {}) => ({
    papel: req.session.usuarioLogado?.papel || 'USER', // Papel do usuário
    usuario: req.session.usuarioLogado?.nome || '',    // Nome do usuário
    paginaAtual: 'os',                                  // Página atual (menu ativo)
    ...extra                                            // Junta dados extras específicos da rota
});

// LISTAGEM
router.get('/', async (req, res) => {
    try {
        const { data = [] } = await api.get('/ordens-servico', auth(req)); // Busca todas as OS do backend

        res.render('os/index', viewData(req, { ordens: data })); // Renderiza página com lista de ordens

    } catch {
        res.render('os/index', viewData(req, { ordens: [] })); // Se der erro, renderiza lista vazia
    }
});


// ----------------------------------------------------------------------------------------



// NOVA (FORM)
router.get('/nova', async (req, res) => {
    try {
        const { data } = await api.get('/clientes', auth(req));
        res.render('os/nova', viewData(req, { clientes: data })); //busca clientes para popular o select (VAMOS MUDAR ISSO)
    } catch {
        res.redirect('/os'); //
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
            clienteId: req.body.clienteId,
            aparelho: req.body.aparelho
        }, auth(req));

        // Mensagem de sucesso ao criar OS
        req.flash('success_msg', 'Ordem de Serviço aberta com sucesso!');
        res.redirect('/os');
    } catch {
        req.flash('error_msg', 'Erro ao abrir Ordem de Serviço.');
        res.redirect('/os/nova');
    }
});



// --------------------------------------------------------------------------------------------


// DETALHES
router.get('/:id', async (req, res) => {
    try {
        const { data } = await api.get(`/ordens-servico/${req.params.id}`, auth(req)); // Busca OS específica pelo ID
        res.render('os/detalhes', viewData(req, { ordem: data }));  // Renderiza página de detalhes
    } catch {
        res.redirect('/os'); // Se não encontrar, volta pra lista
    }
});



// --------------------------------------------------------------------------------------------------


// ATUALIZAR STATUS
router.post('/:id/status', async (req, res) => {
    try {
        await api.put(`/ordens-servico/${req.params.id}/status`,
            { status: req.body.status },
            auth(req)
        );
        // Atualiza status da OS
        req.flash('success_msg', 'Status da OS atualizado!');

    } catch (error) {
        req.flash('error_msg', 'Erro ao atualizar status.');
    } finally {
        res.redirect(`/os/${req.params.id}`);
        // Sempre volta pra página de detalhes
    }
});


// ----------------------------------------------------------------------------------------------



// EXCLUIR
router.post('/:id/excluir', async (req, res) => {
    try {
        await api.delete(`/ordens-servico/${req.params.id}`, auth(req)); // Exclui OS no backend
        req.flash('success_msg', 'Ordem de Serviço removida com sucesso!');
        res.redirect('/os');
    } catch {
        req.flash('error_msg', 'Erro ao excluir a ordem.');
        res.redirect('/os');
    }
});




// ------------------------------------------------------------------------------------------



// EDITAR (FORM)
router.get('/:id/editar', async (req, res) => {
    try {
        const { data: ordem } = await api.get(`/ordens-servico/${req.params.id}`, auth(req)); // Busca OS específica

        if (ordem.status === 'CONCLUIDA') return res.redirect(`/os/${ordem.id}`); // Se já concluída, não permite editar

        res.render('os/editar', viewData(req, { ordem })); //renderiza formulário de edição
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
            clienteId: Number(req.body.clienteId),
            aparelho: req.body.aparelho
        }, auth(req)); // Salva alterações no backend

        req.flash('success_msg', 'Dados da OS atualizados com sucesso!');
        res.redirect(`/os/${req.params.id}`);
    } catch {
        req.flash('error_msg', 'Erro ao atualizar dados da OS.');
        res.redirect(`/os/${req.params.id}/editar`);
    }
});

module.exports = router;