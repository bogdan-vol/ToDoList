const express = require('express');
const router = express.Router();

router.get('/todos', (req, res) => {
    db.all('SELECT * FROM todo;', (e, r) => {
        if (e) return res.send({ err: e.toString() });
        res.send(r)
    })
})

module.exports = router;