const express = require('express');
const ph = require('password-hash');
const bodyParser = require('body-parser');

const commons = require('../commons')

const router = express.Router();
router.use(bodyParser.json())

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('todo.db');

router.get('/getAllUsers', (req, res) => {
    db.all('SELECT * FROM users;', (e, r) => {
        if (e) return res.send({ err: e.toString() });
        res.send(r)
    })
})

router.post('/register', (req, res) => {
    let { user, password } = req.body;
    db.all('INSERT INTO users VALUES (?, ?);', [user, ph.generate(password)], (e, r) => {
        if (e) return res.send({ err: e.toString() });
        res.send({ res: r })
    })
})

router.post('/login', async (req, res) => {
    console.log(req.body);
    res.send(await commons.authentication(req.body))
})

module.exports = router;