const express = require('express');
const app = express();
const port = 3000;
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const { getRegisteredUsers } = require('./inMemoryUserRepository');

// Variable globale pour stocker le token généré lors du login
let authToken = null;

// Variable globale pour stocker les utilisateurs authentifiés
let authenticatedUsers = {};

// Middleware firewall avec tableau d'URL non restreintes
function firewall(req, res, next) {
    const unprotectedUrls = [
        '/url1',
        '/url2',
        '/login',
        '/authenticate',
        '/register' // Ajouter la route d'inscription aux URL non restreintes
    ];

    const requestedUrl = req.url;

    // Vérifier si l'URL demandée est non restreinte
    if (unprotectedUrls.includes(requestedUrl)) {
        next(); // Passer au middleware suivant
    } else {
        // Vérifier si le client a fourni le bon token dans le header authorization
        const token = req.headers['authorization'];
        if (token && token === `Bearer ${authToken}`) {
            next(); // Passer au middleware suivant
        } else {
            // Renvoyer une erreur 403 pour accès interdit
            res.status(403).send();
        }
    }
}

// Middleware pour afficher le contenu de request.headers à chaque requête entrante
function logHeaders(req, res, next) {
    console.log("Headers de la requête :", req.headers);
    next();
}

// Middleware pour vérifier les identifiants
function checkCredentials(email, password) {
    const users = getRegisteredUsers();
    return users.find(user => user.email === email && user.password === password);
}

// Middleware pour inscrire un nouvel utilisateur
function newUserRegistered(email, password) {
    const users = getRegisteredUsers();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return false; // L'utilisateur existe déjà
    }

    // Hasher le mot de passe (à remplacer par une version sécurisée avec salt dans un environnement de production)
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Ajouter le nouvel utilisateur
    users.push({ email, password: hashedPassword });
    return true; // Nouvel utilisateur ajouté avec succès
}

app.use(express.json()); // Middleware pour parser le corps des requêtes en JSON
app.use(logHeaders); // Utiliser le middleware pour afficher les headers
app.use(firewall); // Utiliser le middleware firewall

// Endpoint /authenticate pour permettre à l'utilisateur de s'authentifier
app.post('/authenticate', (req, res) => {
    const { email, password } = req.body;

    // Vérifier si les identifiants sont valides
    const user = checkCredentials(email, password);
    if (!user) {
        // Si les identifiants sont invalides, renvoyer une erreur 403
        return res.status(403).send('Invalid email or password');
    }

    // Générer un UUID
    const token = uuid.v4();

    // Mettre à jour la variable globale authToken avec le token de l'utilisateur
    authToken = token;

    // Renvoyer le token au client
    res.json({ token });
});

// Endpoint /register pour permettre à l'utilisateur de s'inscrire
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur est déjà inscrit
    const userRegistered = newUserRegistered(email, password);
    if (!userRegistered) {
        // Si l'utilisateur est déjà inscrit, renvoyer une erreur 409 (Conflict)
        return res.status(409).send('User already registered');
    }

    // Si l'inscription est réussie, renvoyer une confirmation
    res.send('User registered successfully');
});


app.post('/login', (req, res) => {
    // Générer un token unique et renvoyer par cookie
    res.json({ token: '42' });
});

app.get('/url1', (req, res) => {
    res.send('Hello World!');
});

app.get('/url2', (req, res) => {
    res.send('Hello World!');
});

app.get('/private/url1', (req, res) => {
    res.send('Hello it is secret');
});

// Route /restricted2 avec vérification du token
app.get('/restricted2', (req, res) => {
    res.send('<h1>Admin space</h1>');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
