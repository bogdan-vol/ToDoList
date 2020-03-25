const ph = require('password-hash');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('todo.db');

module.exports = {
    authentication: ({ user, password }) => {
        return new Promise(res => {
            db.all('SELECT * FROM users WHERE user = ?;', [user], (e, r) => {
                if (e) return res({ err: e.toString() });
                if (!r.length) return res({ err: 'No such user!' })
                res({ authenticated: ph.verify(password, r[0].password) });
            })
        })
    }
}