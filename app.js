const express = require('express');
const app = express();
const port = 3000;

// Middleware qui affiche le contenu de request.headers à chaque requête entrante
function logHeaders(req, res, next) {
    console.log("Headers de la requête :", req.headers);
    next();
}

// Middleware firewall avec tableau d'URL non restreintes
function firewall(req, res, next) {
    const unprotectedUrls = [
        '/url1',
        '/url2',
        '/login'
    ];

    const requestedUrl = req.url;

    // Vérifier si l'URL demandée est non restreinte
    if (unprotectedUrls.includes(requestedUrl)) {
        next(); // Passer au middleware suivant
    } else {
        // Vérifier si le client a fourni le bon token dans le header authorization
        const token = req.headers['authorization'];
        if (token && token === 'Bearer 42') {
            next(); // Passer au middleware suivant
        } else {
            // Renvoyer une erreur 403 pour accès interdit
            res.status(403).send();
        }
    }
}

app.use(logHeaders); // Utiliser le middleware pour afficher les headers
app.use(firewall); // Utiliser le middleware firewall

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



