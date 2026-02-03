const axios = require('axios');
require('dotenv').config();

const api = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:8080/api'
});

api.getAuth = req => {
    const authKey =
        req.session?.authKey ||
        Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');

    return {
        headers: { Authorization: `Basic ${authKey}` }
    };
};

module.exports = api;
