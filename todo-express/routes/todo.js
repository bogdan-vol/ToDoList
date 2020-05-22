const { authentication, db, router } = require('../commons');

//toate endpointurile tre sa inceapa cu valideze autentificarea:
//let {authenticated, userId} = await authentication(req.headers);
//metoda verifica userul si parola, care de acuma le trimitem in headers, si returneaza userId si daca userul si parola is ok
//daca-s ok procesu poate merge mai departe

router.get('/todos', async (req, res) => {
  if (!req.headers) return res.send({ authenticated: false });
  let { authenticated, userId } = await authentication(req.headers);

  if (!authenticated) return res.send({ authenticated: false });
  db.all('SELECT ROWID, * FROM todo WHERE id_user = ?;', [userId], (e, r) => {
    if (e) return res.send({ err: e.toString() });
    res.send(r);
  });
});

router.post('/todos', async (req, res) => {
  if (!req.headers) return res.send({ authenticated: false });
  let { authenticated, userId } = await authentication(req.headers);
  if (!authenticated) return res.send({ authenticated: false });
  let {
    name,
    type,
    date,
    time,
    location,
    latitude,
    longitude,
    importance,
    details,
    finished
  } = req.body;
  db.all(
    'INSERT INTO todo VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [
      name,
      type,
      date,
      time,
      location,
      latitude,
      longitude,
      importance,
      details,
      finished
    ],
    (e, r) => {
      if (e) return res.send({ err: e.toString() });
      res.send(r);
    }
  );
});

//creaza endpointul de PUT
//o sa-l folosesti in caz ca vrei sa faci update la un item To Do
router.put('/todos/:id', async (req, res) => {
  if (!req.headers) return res.send({ authenticated: false });
  let { authenticated, userId } = await authentication(req.headers);
  if (!authenticated) return res.send({ authenticated: false });
  let {
    name,
    type,
    date,
    time,
    location,
    latitude,
    longitude,
    importance,
    details,
    finished
  } = req.body;
  db.all(
    'UPDATE todo SET name = ?, type = ?, date = ?, time = ?, location = ?, latitude = ?, longitude = ?, importance = ?, details = ?, finished = ?  WHERE ROWID = ? AND id_user = ?;',
    [
      name,
      type,
      date,
      time,
      location,
      latitude,
      longitude,
      importance,
      details,
      finished,
      req.params.id,
      userId
    ],
    (e, r) => {
      if (e) return res.send({ err: e.toString() });
      res.send(r);
    }
  );
});

//req.params.id vine din .../:id
//se poate folosi la orice tip de endpoint
//o sa-l folosesti si la PUT
router.delete('/todos/:id', async (req, res) => {
  if (!req.headers) return res.send({ authenticated: false });
  let { authenticated, userId } = await authentication(req.headers);
  if (!authenticated) return res.send({ authenticated: false });
  db.all(
    'DELETE FROM todo WHERE ROWID = ? AND id_user = ?',
    [req.params.id, userId],
    (e, r) => {
      if (e) return res.send({ err: e.toString() });
      res.send(r);
    }
  );
});

module.exports = router;
