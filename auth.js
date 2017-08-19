/**
 * Created by kgrube on 5/2/2017.
 */
const basicAuth = require('basic-auth');

const {CS_USERNAME, CS_PASSWORD} = process.env;

exports.checkAuth = (req, res, next) => {
  let name, pass;
  try {
    const basic = basicAuth(req);
    name = basic.name;
    pass = basic.pass;
  } catch (err) {
    return res.status(401).json({error: 'Authentication failure.'});
  }

  if (name === CS_USERNAME && pass === CS_PASSWORD) {
    return next();
  }

  res.status(401).json({error: 'Authentication failure.'});
};
