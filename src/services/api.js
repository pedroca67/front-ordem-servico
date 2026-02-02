// src/services/api.js
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Exportamos uma função para facilitar a criação do cabeçalho de autenticação
api.getAuthHeader = (username, password) => {
  return {
    auth: {
      username: username,
      password: password
    }
  };
};

module.exports = api;