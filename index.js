const express = require('express');
const app = express();
const db = require('sqlite');
const bodyParser = require('body-parser');
const pug = require('pug');
const methodOverride = require('method-override');
const PORT = process.env.PORT || 8080

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'pug');
app.use(methodOverride('_method'));

db.open('data.db').then(() => {
  db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,pseudo,email,firstname,lastname,createdAt,updatedAt)');
})

app.all('*', (req, res, next) => {
  console.log("Bienvenue sur notre superbe API");
  next()
})

app.get('/', (req, res) => {
  res.send('Bonjour à tous');
})

app.post('/users', (req, res) => {
  if(req.body)
  {
    insertIntoDatabase(req.body).then(() => {
      res.redirect('/users');
    })
  }
  else {
    res.send('Aucune donnée POST');
  }
})

app.get('/users', (req, res) => {
  getUsers().then((response) => {
    res.format({
      'text/html': function() {
        res.render('index', {message : response});
      },
      'application/json': function() {
        res.send({ message: response});
      },
      'default': function() {
        res.status(406).send('Not Acceptable');
      }
    });
  })
})

app.get('/users/add', (req, res) => {
  res.render('edit', {message : '', method : 'post'});
})

app.get('/users/:userId/edit', (req, res) => {
  selectFromDatabase(req.params.userId).then((response) => {
    res.render('edit', {message : response, method : 'put'});
  })
})

app.get('/users/:userId/delete', (req, res) => {
  selectFromDatabase(req.params.userId).then((response) => {
    res.render('edit', {message : response, method : 'delete'});
  })
})

app.get('/users/:userId', (req, res) => {
  selectFromDatabase(req.params.userId).then((response) => {
    res.format({
      'text/html': function() {
        res.render('show', {message : response});
      },
      'application/json': function() {
        res.send({ message: response});
      },
      'default': function() {
        res.status(406).send('Not Acceptable');
      }
    });
  })
})

app.put('/users/:userId', (req, res) => {
  updateUser(req.body, req.params.userId).then((response) => {
      res.redirect('/users');
  })
})

app.delete('/users/:userId', function (req, res) {
  deleteUser(req.params.userId).then(() => {
    res.redirect('/users');
  })
});


app.listen(PORT, () => {
  console.log('Serveur sur port : ', PORT);
})

app.use((req, res) => {
  res.status(501);
  res.end('Not implemented');
})

function insertIntoDatabase(parameters){
  return db.run("INSERT INTO users VALUES (NULL,?,?,?,?,?,?)", parameters.pseudo, parameters.email, parameters.firstname, parameters.lastname, Date.now(), "")
}

function selectFromDatabase(userId, parameters){

  return db.get("SELECT * FROM users WHERE id=?", userId);
}

function deleteUser(userId)
{
  return db.run("DELETE FROM users WHERE id=?", userId);
}

function getUsers()
{
  return db.all("SELECT * FROM users");
}

function updateUser(parameters, userId)
{
  return db.run("UPDATE users SET pseudo=?, email=?, firstname=?, lastname=?, updatedAt=? WHERE id=?", parameters.pseudo, parameters.email, parameters.firstname, parameters.lastname, Date.now(), userId);
}
