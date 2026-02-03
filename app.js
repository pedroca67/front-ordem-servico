const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash'); // Importa o connect-flash para mensagens de feedback
require('dotenv').config(); // garante que o Node leia o .env

const app = express();

// 1. CONFIGURAÇÕES BÁSICAS
app.set('view engine', 'ejs'); // renderiza páginas .ejs
app.set('views', path.join(__dirname, 'src', 'views')); // isnforma onde ficam os arquivos .ejs (pasta views)
app.use(express.urlencoded({ extended: true }));// Permite receber dados de formulários (POST)
app.use(express.json()); // Permite receber dados em JSON
app.use(express.static(path.join(__dirname, 'public'))); // Libera a pasta public para arquivos estáticos


// 2. CONFIGURAÇÃO DE SESSÃO
app.use(session({
    secret: 'chave-secreta-da-assistencia', // Chave usada para encriptar a sessão (seguranca)
    resave: false, //  não salva a sessão novamente se nada mudou
    saveUninitialized: true, // cria sessão mesmo sem dados (para o login)
    // cookie: { secure: false } // Em produção com HTTPS, mudar para true
}));

// CONFIGURAÇÃO DO FLASH (Deve vir após a sessão)
app.use(flash());

// 3. MIDDLEWARE DE PROTEÇÃO GLOBAL E RES.LOCALS
app.use((req, res, next) => {
    const rotaSolicitada = req.path; //pega o caminho da URL atual (ex: /clientes)

    const rotasPublicas = ['/login', '/css', '/js', '/img']; //rotas que não precisam de login

    const ehPublica = rotasPublicas.some(publica => rotaSolicitada.startsWith(publica)); //verifica se a rota atual começa com alguma rota pública (ex: /login/...)


    // Se não for pública e nao estiver logado 
    if (!ehPublica && !req.session.usuarioLogado) {
        return res.redirect('/login'); //Bloqueia e manda para o Login
    }

    // Configura variáveis globais para os arquivos .EJS (Header/Menu)
    if (req.session.usuarioLogado) {
        // CORREÇÃO: Acessando diretamente .nome e .papel (estrutura segura)
        res.locals.usuario = req.session.usuarioLogado.nome || 'Usuário'; //nome do usuário no topo
        res.locals.papel = req.session.usuarioLogado.papel || 'USER'; //cargo do usuário no topo
        res.locals.paginaAtual = rotaSolicitada.split('/')[1] || 'dashboard'; //VERIFICAR ISSO AQUIII
    } else {
        res.locals.usuario = null; //sem usuario logado
        res.locals.papel = null; // sem role pra ele
        res.locals.paginaAtual = 'login'; // página atua será login
    }

    // Disponibiliza as mensagens flash para todas as views EJS
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    next();  // Continua para a próxima rota/middleware
});

// 4. IMPORTAÇÃO E USO DAS ROTAS
const authRoutes = require('./src/routes/auth'); // Rotas de autenticação
const indexRoutes = require('./src/routes/index'); // Rota principal "/" (home)
const clienteRoutes = require('./src/routes/clientes'); // Rotas relacionadas a clientes

const osRoutes = require('./src/routes/os'); // Rotas de ordens de serviço

const relatoriosRoutes = require('./src/routes/relatorios');// Rotas de relatórios
const usuariosRoutes = require('./src/routes/usuarios'); // Rotas de usuários

// Rotas públicas e de autenticação
app.use('/', authRoutes);

// Rotas que passam pelo filtro de proteção
//tudo que começa com /xxx vai pra xxx.js
app.use('/', indexRoutes);
app.use('/clientes', clienteRoutes);
app.use('/os', osRoutes);
app.use('/relatorios', relatoriosRoutes);
app.use('/usuarios', usuariosRoutes);

// 5. TRATAMENTO DE ERROS (OPCIONAL)
app.use((req, res) => {   // Esse middleware só é executado se nenhuma rota anterior respondeu ao pesquisado
    res.status(404).render('error', {     //define o status http  como 404 (não encontrado)
        mensagem: "Página não encontrada",  //renderiza a view error.ejs
        erro: "404" 
    });
});

// 6. INICIALIZAÇÃO
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Frontend rodando em http://localhost:${PORT}`);
    console.log(`Conectado à API: ${process.env.API_URL}`);
    console.log(`========================================`);
});