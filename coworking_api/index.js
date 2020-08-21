const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
// const [getAuthName, setUser, getPlaces] = require('./models/bd');
// import [getAuthName, setUser, getPlaces] from './models/bd.js';
const bd = require('./models/bd');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(PORT);
});

app.post('/auth', (req, res) => {
  bd.getAuthName(req.body.login, req.body.password, res);
});

app.post('/reg', (request, response) => {
  bd.setUser(request.body.userName, request.body.login, request.body.password);
});
app.post('/getplaces', (request, response) => {
  bd.getPlaces(response);
});
app.post('/getuser', bd.middleware, (request, response) => {
  bd.getUser(request, response);
});
app.post('/setplaces', (request, response) => {
  bd.setPlace(request.body, response);
  console.log(request.body);
});
app.post('/deleteplaces', (request, response) => {
  bd.deletePlace(request.body);
  console.log(request.body);
});
app.post('/setcomment', (request, response) => {
  bd.setCommentPlace(request.body);
});
app.post('/getcomment', (request, response) => {
  bd.getCommentPlace(request.body, response);
});
app.post('/getfavorite', (request, response) => {
  bd.getFavorite(request.body, response);
});
app.post('/deletefavorite', (request, response) => {
  bd.deleteFavorite(request.body, response);
});
app.post('/addfavorite', (request, response) => {
  bd.addFavorite(request.body, response);
});
app.post('/deletefavorite', (request, response) => {
  bd.deleteFavorite(request.body, response);
});
app.post('/getallusers', (request, response) => {
  bd.getAllUser(response);
});
app.post('/getallcomment', (request, response) => {
  bd.getAllComment(response);
});
app.post('/deleteuser', (request, response) => {
  bd.deleteUser(request.body);
});
app.post('/deletecomment', (request, response) => {
  bd.deleteComment(request.body);
});
