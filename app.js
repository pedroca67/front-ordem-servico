const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// 1. CONFIGURAÇÕES BÁSICAS (Sempre primeiro)
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
    cookie: { secure: false }
}));

// 3. MIDDLEWARE DE PROTEÇÃO GLOBAL (Deve vir ANTES de TODAS as rotas, exceto Auth)
app.use((req, res, next) => {
    const rotaSolicitada = req.path;
    const rotasPublicas = ['/login', '/css', '/js', '/img']; 

    const ehPublica = rotasPublicas.some(publica => rotaSolicitada.startsWith(publica));

    // Se NÃO for pública e NÃO estiver logado -> Bloqueia
    if (!ehPublica && !req.session.usuarioLogado) {
        return res.redirect('/login');
    }

    // Configura variáveis para o Header se estiver logado
    if (req.session.usuarioLogado) {
        res.locals.usuario = req.session.usuarioLogado.dados.nome;
        res.locals.papel = req.session.usuarioLogado.dados.roles[0];
        res.locals.paginaAtual = rotaSolicitada.split('/')[1] || 'dashboard';
    } else {
        res.locals.usuario = null;
        res.locals.papel = null;
    }

    next();
});

// 4. IMPORTAÇÃO E USO DAS ROTAS (Sempre DEPOIS do middleware de proteção)
const authRoutes = require('./src/routes/auth');
const indexRoutes = require('./src/routes/index');
const clienteRoutes = require('./src/routes/clientes');
const osRoutes = require('./src/routes/os');
const relatoriosRoutes = require('./src/routes/relatorios');
const usuariosRoutes = require('./src/routes/usuarios'); // Movi para cá

app.use('/', authRoutes);      // Login/Logout (que o middleware libera)
app.use('/', indexRoutes);     // Dashboard protegida
app.use('/clientes', clienteRoutes); // Protegida
app.use('/os', osRoutes);            // Protegida
app.use('/relatorios', relatoriosRoutes); // Protegida
app.use('/usuarios', usuariosRoutes);     // AGORA PROTEGIDA!

// 5. INICIALIZAÇÃO
const PORT = 3000;
app.listen(PORT, () => console.log(`Frontend rodando em http://localhost:${PORT}`));