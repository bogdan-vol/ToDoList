const {authentication, db, ph, router} = require('../commons');

router.get('/getAllUsers', (req, res) => {
  db.all('SELECT * FROM users;', (e, r) => {
    if (e) return res.send({err: e.toString()});
    res.send(r);
  });
});

router.post('/register', (req, res) => {
  let {user, password} = req.body;
  db.all(
    'INSERT INTO users VALUES (?, ?);',
    [user, ph.generate(password)],
    (e, r) => {
      if (e) {
        if (e.toString().indexOf('UNIQUE constraint') > 0)
          return res.send({
            err: 'This user already exists. Please choose another user!',
          });
        return res.send({err: e.toString()});
      }
      res.send({authenticated: true});
    },
  );
});

router.post('/login', async (req, res) => {
  res.send(await authentication(req.body));
});

module.exports = router;
