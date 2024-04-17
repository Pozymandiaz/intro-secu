const express = require('express');
const app = express();
const port = 3000;

// Variable globale pour stocker le token généré lors du login
let authToken = null;

// Middleware firewall avec tableau d'URL non restreintes
function firewall(req, res, next) {
    const unprotectedUrls = [
        '/url1',
        '/url2',
        '/login',
        '/authenticate' // Ajouter la route d'authentification aux URL non restreintes
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

app.use(express.json()); // Middleware pour parser le corps des requêtes en JSON
app.use(firewall); // Utiliser le middleware firewall

// Route POST /authenticate pour permettre à l'utilisateur de s'authentifier
app.post('/authenticate', (req, res) => {
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis (validation minimale)
    if (email && password) {
        // Générer un token aléatoire (naïvement)
        authToken = Math.random().toString(36).substring(7);
        res.json({ token: authToken }); // Retourner le token au client
    } else {
        res.status(400).json({ message: 'Email et mot de passe requis' });
    }
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
