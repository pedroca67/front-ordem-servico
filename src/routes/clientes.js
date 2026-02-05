const express = require('express');
const router = express.Router();
const api = require('../services/api');

// LISTAR CLIENTES
router.get('/', async (req, res) => { //rota principal /clientes
    try {
        const auth = api.getAuth(req); //salvamos na sessão a autenticação

        const response = await api.get('/clientes', auth); //busca lista de clientes na api
        const listaClientes = Array.isArray(response.data) ? response.data : []; //garante que seja um vetor

        res.render('clientes/index', {  // Renderiza tela com lista de clientes
            clientes: listaClientes,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes'
        });

    } catch (error) {
        console.error("Erro ao listar clientes:", error.message);
        res.render('clientes/index', {
            clientes: [],
            papel: req.session.usuarioLogado?.papel || 'USER',
            usuario: req.session.usuarioLogado?.nome || 'Erro',
            paginaAtual: 'clientes'
        });   //se der error, mostra página vazia
    }
});



// --------------------------------------------------------------------------------------------



// FORMULÁRIO NOVO CLIENTE
router.get('/novo', (req, res) => { //abre formulario(get)
    res.render('clientes/novo', {
        papel: req.session.usuarioLogado.papel,
        usuario: req.session.usuarioLogado.nome,
        paginaAtual: 'clientes',
        erro: null,
        cliente: {}  
    }); //renderiza formulario vazio
});

// PROCESSAR CADASTRO
router.post('/novo', async (req, res) => { // Recebe dados do formulário(post)
    try {
        const auth = api.getAuth(req); //Autenticação
        await api.post('/clientes', req.body, auth);//envia dados para API criar cliente
        
        // Define a mensagem de sucesso antes de redirecionar
        req.flash('success_msg', 'Cliente cadastrado com sucesso!');
        res.redirect('/clientes');  // Volta para listagem

    } catch (error) {
        console.error("Erro ao salvar cliente:", error.response?.data || error.message);
        
        // Captura a mensagem principal e os erros específicos por campo
        const apiErro = error.response?.data;
        const msg = apiErro?.status === 409 ? apiErro.message : "Não foi possível salvar o cliente.";
        const errosCampos = apiErro?.errors || {}; // Erros por campo (cpf, telefone etc)

        res.render('clientes/novo', {
            erro: msg,
            errosCampos: errosCampos, // Enviando os detalhes para a tela e renderizando de novo
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            cliente: req.body,
            editando: false
        });
    }
});



// -----------------------------------------------------------------------------------



// EXCLUIR CLIENTE
router.get('/:id/excluir', async (req, res) => { // remove pelo id
    try {
        const auth = api.getAuth(req);
        await api.delete(`/clientes/${req.params.id}`, auth); //chama a api pra excluir
        
        // Adicionada mensagem de confirmação para exclusão
        req.flash('success_msg', 'Cliente removido com sucesso!');
        res.redirect('/clientes'); //volta pra lista
    } catch (error) {
        console.error("Erro ao excluir cliente:", error.message);
        req.flash('error_msg', 'Erro ao excluir cliente.');
        res.redirect('/clientes');
    }
});


// -------------------------------------------------------------------------------



// EXIBIR FORMULÁRIO DE EDIÇÃO
router.get('/:id/editar', async (req, res) => { // Abre formulário já preenchido
    try {
        const auth = api.getAuth(req); //autenticação

        const response = await api.get(`/clientes/${req.params.id}`, auth);  // Busca cliente pelo ID
        const clienteEncontrado = response.data;

        res.render('clientes/novo', {  
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            erro: null,
            cliente: clienteEncontrado, 
            editando: true // Bandeira para mudar o título na view
        });
    } catch (error) {
        console.error("Erro ao buscar cliente para edição:", error.message);
        res.redirect('/clientes');
    }
});

// PROCESSAR A ATUALIZAÇÃO
router.post('/:id/editar', async (req, res) => {  // Recebe alterações do formulário
    try {
        const auth = api.getAuth(req);
        await api.put(`/clientes/${req.params.id}`, req.body, auth); // Atualiza cliente na API
        
        // Define a mensagem de sucesso antes de redirecionar
        req.flash('success_msg', 'Dados do cliente atualizados com sucesso!');
        res.redirect('/clientes');  // Volta para lista


    } catch (error) {
        console.error("Erro ao atualizar cliente:", error.response?.data || error.message);
        
        const apiErro = error.response?.data;
        const errosCampos = apiErro?.errors || {};

        res.render('clientes/novo', {
            erro: "Erro ao salvar alterações. Verifique os campos abaixo.",
            errosCampos: errosCampos,
            papel: req.session.usuarioLogado.papel,
            usuario: req.session.usuarioLogado.nome,
            paginaAtual: 'clientes',
            cliente: { ...req.body, id: req.params.id },
            editando: true
            // Retorna pro formulário mantendo dados
        });
    }
});


// ----------------------------------------------------------------------------



// Adicione esta rota ao seu arquivo para testar a busca
router.get('/api/buscar', async (req, res) => {
    try {
        const auth = api.getAuth(req);
        const termo = req.query.q || '';
        // Pega termo digitado
        
        // Chamada para o Java (Spring Boot)
        // O Java espera /api/clientes/buscar?nome=...
        const response = await api.get(`/clientes/buscar?nome=${encodeURIComponent(termo)}`, auth);
        
        res.json(response.data);
    } catch (error) {
        console.error("Erro na API Java:", error.response?.data || error.message);
        res.status(500).json([]);
    }
});

module.exports = router;