const express = require('express');
const ph = require('password-hash');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('todo.db');

const router = express.Router();
router.use(bodyParser.json());

module.exports = {
  ph,
  db,
  router,
  authentication: ({user, password}) => {
    return new Promise(res => {
      if (!user || !password) res({authenticated: false});
      db.all('SELECT *, ROWID FROM users WHERE user = ?;', [user], (e, r) => {
        if (e) return res({err: e.toString()});
        if (!r.length) return res({err: 'No such user!'});
        res({
          userId: r[0].rowid,
          authenticated: ph.verify(password, r[0].password),
        });
      });
    });
  },
};
