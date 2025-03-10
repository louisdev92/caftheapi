const request = require('supertest');
const express = require('express');
const routeModule = require('../endpoints');
const db = require('../db.test'); // Bdd de test

const app = express();
app.use(express.json());
app.use('/api', routeModule);

describe('Endpoints pour les produits', () => {

})
