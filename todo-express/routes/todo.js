const {authentication, db, router} = require('../commons');

router.get('/todos', async (req, res) => {
  if (!req.headers) return res.send({authenticated: false});
  let {authenticated, userId} = await authentication(req.headers);

  if (authenticated)
    db.all('SELECT ROWID, * FROM todo WHERE id_user = ?;', [userId], (e, r) => {
      if (e) return res.send({err: e.toString()});
      res.send(r);
    });
  else res.send({authenticated: false});
});

router.post('/todos', async (req, res) => {
  if (!req.headers) return res.send({authenticated: false});
  let {authenticated, userId} = await authentication(req.headers);
  if (authenticated) {
    let {name, type, date, time, location, importance, finished} = req.body;
    db.all(
      'INSERT INTO todo VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [name, type, date, time, location, importance, finished, userId],
      (e, r) => {
        if (e) return res.send({err: e.toString()});
        res.send(r);
      },
    );
  } else res.send({authenticated: false});
});

router.delete('/todos/:id', async (req, res) => {
  if (!req.headers) return res.send({authenticated: false});
  let {authenticated, userId} = await authentication(req.headers);
  if (authenticated) {
    db.all(
      'DELETE FROM todo WHERE ROWID = ? AND id_user = ?',
      [req.params.id, userId],
      (e, r) => {
        if (e) return res.send({err: e.toString()});
        res.send(r);
      },
    );
  } else res.send({authenticated: false});
});

module.exports = router;
