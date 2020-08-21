let jwt = require('jsonwebtoken');
const { jwtSecret } = require('../meta');
let bCrypt = require('bcrypt');
const { db } = require('../meta');
db.connect((err) => {
  if (err) return err;
  console.log('Connected to postgres! Getting schemas...');
});

const middleware = (request, response, next) => {
  console.log(request.headers.authorization);
  if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
    let token = request.headers.authorization.split(' ')[1];
    token = jwt.verify(token, jwtSecret);
    db.query('SELECT id_users from users WHERE id_users=$1', [token.id_users]).then((res) => {
      console.log(res.rows);
      console.log(token);
      if (res.rows[0].id_users == token.id_users) next();
      else response.status(403).send({ message: 'Unauthorized' });
    });
  }
};

const getAuthName = (login, password, res) => {
  db.query('SELECT user_name, id_users, password FROM users WHERE login=$1', [login], (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      if (results.rows.length && bCrypt.compareSync(password, results.rows[0].password)) {
        res.status(200).send({
          token: jwt.sign(
            {
              id_users: results.rows[0].id_users,
              name: results.rows[0].user_name,
            },
            jwtSecret
          ),
          message: 'Пользователь успешно авторизован',
          data: {
            user_name: results.rows[0].user_name,
            id_users: results.rows[0].id_users,
          },
        });
      } else {
        res.status(401).send({});
      }
    }
  });
};

const getUser = (req, res) => {
  token = jwt.verify(req.headers.authorization.split(' ')[1], jwtSecret);
  db.query('SELECT user_name, id_users FROM users WHERE id_users=$1', [token.id_users], (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      if (results.rows.length) {
        res.status(200).send({
          data: {
            user_name: results.rows[0].user_name,
            id_users: results.rows[0].id_users,
          },
        });
      } else {
        res.status(401).send({});
      }
    }
  });
};

const getPlaces = (res) => {
  db.query('select * from service_cafe, service, place where place.id_place=service.place_id_place and place.id_place=service_cafe.id_place', (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results.rows,
      });
    }
  });
};

const setUser = (user_name, login, password) => {
  let pass = bCrypt.hashSync(password, 10);
  db.query('INSERT INTO users(user_name,login,password) VALUES($1,$2,$3)', [user_name, login, pass], (err, results) => {
    if (err) {
      console.log(err);
    }
  });
};

const setPlace = (request, res) => {
  const title_place = request[0].options.title_place;
  const form_place = request[0].options.form_place;
  const address_place = request[0].options.address_place;
  const photo_link_place = request[0].options.photo_link_place;
  const lat = request[0].options.lat;
  const long = request[0].options.long;
  const description = request[0].options.description_place;
  const metro = request[0].options.metro;
  const working_day = request[0].options.working_day;
  const price = request[0].options.price;
  const web = request[0].options.web;
  db.query(
    'INSERT INTO place(title_place, adress_place, form_place, foto_data, lat, long, description, metro_place, working_day, price, web) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id_place',
    [title_place, address_place, form_place, JSON.stringify(photo_link_place), lat, long, description, metro, JSON.stringify(working_day), JSON.stringify(price), web],
    (err, results) => {
      if (err) {
        return res.send(err);
        console.log(err);
      } else {
        console.log('--------------------------------------   ');
        console.log(results.rows);
        insertService(results.rows, request);
        insertServiceCafe(results.rows, request);
      }
    }
  );
};
const insertServiceCafe = (results, request) => {
  db.query('INSERT INTO service_cafe(id_place, service_cafe) VALUES($1, $2)', [results[0].id_place, JSON.stringify(request[2].parametersCafe)], (err) => {
    if (err) console.log(err);
  });
};
const insertService = (results, request) => {
  const internet = request[1].extraOptions.internet;
  const save_item = request[1].extraOptions.save_item;
  const round_clock = request[1].extraOptions.round_clock;
  const not_weekend = request[1].extraOptions.not_weekend;
  const conference_hall = request[1].extraOptions.conference_hall;
  const zoning = request[1].extraOptions.zoning;
  const static_seat = request[1].extraOptions.static_seat;
  const kitchen = request[1].extraOptions.kitchen;
  const printer = request[1].extraOptions.printer;
  const projector = request[1].extraOptions.projector;
  const television = request[1].extraOptions.television;
  const coffee_cookies = request[1].extraOptions.coffee_cookies;
  const PC = request[1].extraOptions.PC;
  const specialized_equipment = request[1].extraOptions.specialized_equipment;
  const cooler = request[1].extraOptions.cooler;
  const secretary = request[1].extraOptions.secretary;
  const specialized_service = request[1].extraOptions.specialized_service;
  const food_court = request[1].extraOptions.food_court;
  const leisure = request[1].extraOptions.leisure;
  const writing_supplies = request[1].extraOptions.writing_supplies;
  db.query(
    'INSERT INTO service(place_id_place, internet, save_item, round_clock, not_weekend, conference_hall, zoning, static_seat, kitchen, printer, projector, television, coffee_cookies, "PC", specialized_equipment, cooler, secretary, specialized_service, food_court, leisure, writing_supplies) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)',
    [results[0].id_place, internet, save_item, round_clock, not_weekend, conference_hall, zoning, static_seat, kitchen, printer, projector, television, coffee_cookies, PC, specialized_equipment, cooler, secretary, specialized_service, food_court, leisure, writing_supplies],
    (err) => {
      if (err) console.log(err);
    }
  );
};

const deletePlace = (request) => {
  request.forEach((id_place) => {
    db.query('delete from service where place_id_place in (select id_place from place where id_place=$1)', [parseInt(id_place)]);
  });
};
const setCommentPlace = (request) => {
  const id_place = request.id_place;
  const id_users = request.id_user;
  const comment = request.comment;
  const rating = request.rating;
  db.query('INSERT INTO comments(text_comment, id_place, id_users, rating) VALUES($1,$2,$3,$4)', [comment, id_place, id_users, rating], (err, res) => {
    if (err) {
      console.log(err);
    }
  });
};
const getCommentPlace = (request, response) => {
  const id_place = request.id_place;
  db.query('SELECT comments.text_comment, users.user_name, comments.rating FROM comments INNER JOIN users ON users.id_users=comments.id_users WHERE comments.id_place=$1', [id_place], (err, res) => {
    if (err) {
      return response.send(err);
    } else {
      return response.json({
        data: res.rows,
      });
    }
  });
};
const getFavorite = (request, response) => {
  const id_user = request.id_users;
  db.query('SELECT id_places FROM favorite_places WHERE id_users=$1', [id_user], (err, res) => {
    if (err) {
      return response.send(err);
    } else {
      return response.json({
        data: res.rows,
      });
    }
  });
};
const addFavorite = (request, response) => {
  const id_place = request.place;
  const id_user = request.user;
  db.query('INSERT INTO favorite_places(id_users, id_places) VALUES($1,$2)', [id_user, id_place]);
};
const deleteFavorite = (request, response) => {
  const id_place = request.place;
  const id_user = request.user;
  db.query('delete from favorite_places WHERE id_users=$1 and id_places=$2', [id_user, id_place]);
};
const getAllUser = (response) => {
  db.query("select user_name, id_users, login from users where user_name !='admin'", (err, res) => {
    if (err) {
      console.log(err);
      return response.send(err);
    } else {
      console.log('------------------');
      console.log(res.rows);
      return response.json({
        data: res.rows,
      });
    }
  });
};
const getAllComment = (response) => {
  db.query('select id_comment, text_comment, id_users, rating, id_place from comments', (err, res) => {
    if (err) {
      return response.send(err);
    } else {
      return response.json({
        data: res.rows,
      });
    }
  });
};
const deleteUser = (request) => {
  db.query('delete from comments where id_users = $1', [request.user], (err, res) => {
    if (err) {
      return response.send(err);
    } else {
      db.query('delete from favorite_places where id_users = $1', [request.user], (err, res) => {
        if (err) {
          return response.send(err);
        } else {
          db.query('delete from users where id_users = $1', [request.user]);
        }
      });
    }
  });
};
const deleteComment = (request) => {
  db.query('delete from comments where id_comment = $1', [request.comment]);
};
exports.deleteComment = deleteComment;
exports.deleteUser = deleteUser;
exports.getAllComment = getAllComment;
exports.getAllUser = getAllUser;
exports.getUser = getUser;
exports.getFavorite = getFavorite;
exports.deleteFavorite = deleteFavorite;
exports.addFavorite = addFavorite;
exports.getAuthName = getAuthName;
exports.setUser = setUser;
exports.getPlaces = getPlaces;
exports.setPlace = setPlace;
exports.deletePlace = deletePlace;
exports.setCommentPlace = setCommentPlace;
exports.getCommentPlace = getCommentPlace;
exports.middleware = middleware;
