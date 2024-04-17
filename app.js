const express = require('express')
const app = express()
const port = 3000

let publicUrls = [
    '/url1',
    '/url2',
    '/login'
]

function myMiddleware(req, res, next) {
    const requestedUrl = req.url;

    // Vérifier si l'URL demandée est publique
    if (publicUrls.includes(requestedUrl)) {
        next(); // Passer au middleware suivant
    } else {
        // Vérifier si l'utilisateur est authentifié
        const token = req.headers['token'];
        if (token && token === '42') {
            next(); // Passer au middleware suivant
        } else {
            // Renvoyer une erreur 403 pour accès interdit
            res.status(403).send();
        }
    }
}

app.use(myMiddleware)

app.post('/login', (req, res) => {
    // Générer un token unique et renvoyer par cookie
    res.json({ token: '42' });
})

app.get('/url1', (req, res) => {
    res.send('Hello World!')
})

app.get('/url2', (req, res) => {
    res.send('Hello World!')
})

app.get('/private/url1', (req, res) => {
    res.send('Hello it is secret')
})

app.get('/restricted2', (req, res) => {
    const token = req.headers['token'];
    if (token && token === '42') {
        res.send('<h1>Admin space</h1>');
    } else {
        res.status(403).send();
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


