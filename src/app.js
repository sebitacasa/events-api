const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routes = require('./routes/index.js');
require('dotenv').config();
var cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

require('./db.js');

const server = express();

server.name = 'API';

server.use(bodyParser.json());

// --- CONFIGURACIÓN CORS MEJORADA ---
server.use(cors({
  origin: [
    'http://localhost:5173', // Para cuando pruebas en tu PC
    'https://new-events-final.vercel.app', // Tu producción principal
    'https://new-events-final-bh3s.vercel.app' // Tu deploy actual
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
// -----------------------------------

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));

// NOTA: Borré el bloque manual de headers que tenías aquí porque 'cors' (arriba) ya lo hace.

server.use('/', routes);

// Error catching endware.
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;