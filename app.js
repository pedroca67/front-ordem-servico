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
app.use(express.static(path.join(__dirname, 'src', 'public'))); // Libera a pasta public para arquivos estáticos


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
    const rotaSolicitada = req.path;
    const rotasPublicas = ['/login', '/css', '/js', '/img', '/public', '/favicon'];
    const ehPublica = rotasPublicas.some(publica => rotaSolicitada.startsWith(publica));

    if (!ehPublica && !req.session.usuarioLogado) {
        return res.redirect('/login');
    }

// --- NOVA TRAVA DE SEGURANÇA (AUTORIZAÇÃO) ---
if (req.session.usuarioLogado) {
    // Pegamos o papel e garantimos que estamos tratando "ROLE_ADMIN" ou "ADMIN"
    const papel = req.session.usuarioLogado.papel;

    // Criamos uma lógica que aceita tanto "ADMIN" quanto "ROLE_ADMIN"
    const ehAdmin = (papel === 'ADMIN' || papel === 'ROLE_ADMIN');

    const rotasRestritasAdmin = ['/usuarios', '/relatorios'];
    const tentaAcessarRestrito = rotasRestritasAdmin.some(restrita => rotaSolicitada.startsWith(restrita));

    // SE NÃO FOR ADMIN e tentar acessar área restrita, barramos
    if (!ehAdmin && tentaAcessarRestrito) {
        req.flash('error_msg', 'Acesso negado: apenas administradores podem acessar esta área.');
        return res.redirect('/'); 
    }
    
    // O Funcionário (ROLE_USER) passará direto por aqui e seguirá para o next()
}
    // ---------------------------------------------

    // Configura variáveis globais para os arquivos .EJS
    if (req.session.usuarioLogado) {
        res.locals.usuario = req.session.usuarioLogado.nome || 'Usuário';
        res.locals.papel = req.session.usuarioLogado.papel || 'USER';
        res.locals.paginaAtual = rotaSolicitada.split('/')[1] || 'dashboard';
    } else {
        res.locals.usuario = null;
        res.locals.papel = null;
        res.locals.paginaAtual = 'login';
    }

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    next();
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