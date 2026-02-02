const axios = require('axios');
require('dotenv').config(); // Garante que o Node leia o arquivo .env

const api = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:8080/api'
});

// Função para gerar o header de autenticação usando os dados do .env ou da sessão
// Adicione isso ao seu api.js
api.getAuth = (req) => {
    // Se existir a chave na sessão, usa ela. 
    // Se não, pode tentar usar a do .env (para testes/admin)
    const authKey = req.session.authKey || 
                    Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
    
    return {
        headers: { 'Authorization': `Basic ${authKey}` }
    };
};

module.exports = api;