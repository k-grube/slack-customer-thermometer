/**
 * Created by kgrube on 5/2/2017.
 */
/**
 * Module dependencies.
 * @private
 */
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
require('dotenv').config({path: '.env'});
const pmx = require('pmx');
pmx.init({
  http: true,
  errors: true,
  custom_probes: true,
  network: true,
  ports: true,
});
const auth = require('./auth');
const bodyParser = require('body-parser');
const express = require('express');
const expressValidator = require('express-validator');
const logger = require('morgan');

const app = express();

app.set('x-powered-by', false);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator({
  customSanitizers: {
    toNumeric: value => value.replace(/\D/g, ''),
    toLowerCase: value => value.toLowerCase(),
  },
}));

/*
 * Required if express is behind a proxy, e.g. Heroku, nginx
 * https://github.com/expressjs/session/blob/master/README.md
 */
app.set('trust proxy', process.env.TRUST_PROXY === 1 ? 1 : 0);

app.use(auth.checkAuth);

// routes
const routes = require('./routes');
app.use(routes);

// Catch all route, return 404 if none of the above routes matched
app.all('*', (req, res) => res.sendStatus(404).end('NOT FOUND'));

app.use(pmx.expressErrorHandler());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(err);
});

const port = process.env.PORT ? process.env.PORT : 3000;
const host = process.env.HOST ? process.env.HOST : 'localhost';

const runnable = app.listen(port, err => {
  if (err) {
    console.error('HTTP Startup Error', err);
  }

  console.log('\t==> 👌 Listening on https://%s:%s/', host, port);
});

process.on('unhandledRejection', reason => console.error('UnhandledRejection', reason, new Error('UnhandledRejection').stack));

module.exports = app;
