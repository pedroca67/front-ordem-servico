const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config(); // Garante que o Node leia o .env (URL da API, etc)

const app = express();

// 1. CONFIGURAÇÕES BÁSICAS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. CONFIGURAÇÃO DE SESSÃO
app.use(session({
    secret: 'chave-secreta-da-assistencia',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Em produção com HTTPS, mudar para true
}));

// 3. MIDDLEWARE DE PROTEÇÃO GLOBAL E RES.LOCALS
app.use((req, res, next) => {
    const rotaSolicitada = req.path;
    const rotasPublicas = ['/login', '/css', '/js', '/img']; 

    const ehPublica = rotasPublicas.some(publica => rotaSolicitada.startsWith(publica));

    // Se NÃO for pública e NÃO estiver logado -> Bloqueia e manda para o Login
    if (!ehPublica && !req.session.usuarioLogado) {
        return res.redirect('/login');
    }

    // Configura variáveis globais para os arquivos .EJS (Header/Menu)
    if (req.session.usuarioLogado) {
        // CORREÇÃO: Acessando diretamente .nome e .papel (estrutura segura)
        res.locals.usuario = req.session.usuarioLogado.nome || 'Usuário';
        res.locals.papel = req.session.usuarioLogado.papel || 'USER';
        res.locals.paginaAtual = rotaSolicitada.split('/')[1] || 'dashboard';
    } else {
        res.locals.usuario = null;
        res.locals.papel = null;
        res.locals.paginaAtual = 'login';
    }

    next();
});

// 4. IMPORTAÇÃO E USO DAS ROTAS
const authRoutes = require('./src/routes/auth');
const indexRoutes = require('./src/routes/index');
const clienteRoutes = require('./src/routes/clientes');
const osRoutes = require('./src/routes/os');
const relatoriosRoutes = require('./src/routes/relatorios');
const usuariosRoutes = require('./src/routes/usuarios');

// Rotas públicas e de autenticação
app.use('/', authRoutes);

// Rotas que passam pelo filtro de proteção
app.use('/', indexRoutes);
app.use('/clientes', clienteRoutes);
app.use('/os', osRoutes);
app.use('/relatorios', relatoriosRoutes);
app.use('/usuarios', usuariosRoutes);

// 5. TRATAMENTO DE ERROS (OPCIONAL)
app.use((req, res) => {
    res.status(404).render('error', { 
        mensagem: "Página não encontrada", 
        erro: "404" 
    });
});

// 6. INICIALIZAÇÃO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Frontend rodando em http://localhost:${PORT}`);
    console.log(`🔧 Conectado à API: ${process.env.API_URL}`);
    console.log(`========================================`);
});