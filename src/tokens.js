const axios = require('axios');
const connection = require('./db'); // archivo donde estableces la conexión a la base de datos
require('dotenv').config();

const getTokens = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM tokens ORDER BY id DESC LIMIT 1', (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0]);
        });
    });
};

const updateTokens = (access_token, refresh_token) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO tokens (access_token, refresh_token) VALUES (?, ?)', [access_token, refresh_token], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

const refreshAccessToken = async () => {
    try {
        const tokens = await getTokens();
        const response = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
            params: {
                grant_type: 'refresh_token',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                refresh_token: tokens.refresh_token 
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const { access_token, refresh_token } = response.data;
        await updateTokens(access_token, refresh_token);
       console.log('Tokens actualizados correctamente');
        console.log('Nuevo access_token:', access_token);
        console.log('Nuevo refresh_token:', refresh_token);
    } catch (error) {
        console.error('Error al refrescar el token:', error);
    }
};

module.exports = { getTokens, updateTokens, refreshAccessToken };

