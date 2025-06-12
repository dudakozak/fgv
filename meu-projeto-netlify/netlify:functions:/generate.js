// Ficheiro: netlify/functions/generate.js

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    // No Netlify, os dados de um POST vêm no `event.body`
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'O prompt é obrigatório' })
        };
    }

    // A chave da API fica segura nas variáveis de ambiente do Netlify
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Chave da API não configurada no servidor.' })
        };
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    try {
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Erro na API Gemini! status: ${geminiResponse.status} | ${errorText}`);
        }

        const data = await geminiResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data) // A resposta é sempre uma string
        };

    } catch (error) {
        console.error('Erro ao fazer proxy para a API Gemini:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Falha ao buscar dados da API Gemini.' })
        };
    }
};