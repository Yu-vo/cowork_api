let jwt = require('jsonwebtoken');
// let { jwtSecret } = require("./jwt")
let pg = require('pg');

let pool = new pg.Pool({
  user: 'postgres',
  database: '÷',
  password: '',
  host: 'localhost',
  port: 5432,
  max: 10
});

module.exports = (request, response, next) => {
  if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
    let token = request.headers.authorization.split(' ')[1];
    token = jwt.verify(token, jwtSecret);
    pool.query('SELECT id_user from public."user" WHERE id_user=$1', [token.id_user]).then(res => {
      if (res.rows[0].id_user == token.id_user) next();
      else response.status(403).send({ message: 'Unauthorized' });
    });
  }
};
//--------------------

//Регистрация пользователя в системе
app.post('/api/signup', (request, response) => {
  let id_user = uuid.v4();
  let first_name = request.body.first_name;
  let last_name = request.body.last_name;
  let patronymic;
  if (request.body.patronymic) patronymic = request.body.patronymic;
  else patronymic = null;
  let email = request.body.email;
  let password = bCrypt.hashSync(request.body.password, 10);

  const values = [id_user, first_name, last_name, patronymic, email, password];

  // console.log(values)
  pool.query('SELECT * from public."user" WHERE email=$1;', [email]).then(res => {
    if (!res.rows.length) {
      pool
        .query('INSERT INTO public."user" (id_user, first_name, last_name, patronymic, email, password) VALUES($1, $2, $3, $4, $5, $6)', [...values])
        .then(() => response.status(200).send({ message: 'Вы успешно зарегистрированы' }))
        .catch(err => response.status(200).send({ message: 'Ошибка регистрации пользователя' }));
    } else {
      response.status(200).send({ message: 'Пользователь уже существует' });
    }
  });
});

//Авторизация пользователя в системе
app.post('/api/signin', (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  // console.log(values)
  pool.query('SELECT id_user, email, password, key, is_moderator from public."user" WHERE email=$1;', [email]).then(res => {
    if (res.rows.length && bCrypt.compareSync(password, res.rows[0].password)) {
      response.status(200).send({
        token: jwt.sign(
          {
            id_user: res.rows[0].id_user,
            key: res.rows[0].key,
            is_moderator: res.rows[0].is_moderator
          },
          jwtSecret
        ),
        message: 'Пользователь успешно авторизован'
      });
    } else {
      response.status(401).send({});
    }
  });
});
