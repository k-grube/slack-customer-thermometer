/**
 * Created by kgrube on 5/2/2017.
 */
const basicAuth = require('basic-auth');
const request = require('request');

exports.checkMemberCredentials = (req, res, next) => {
  // decode basic auth
  const authorization = basicAuth(req);
  request.post({
    url: `https://${process.env.CW_COMPANY_URL}/v4_6_release/login/login.aspx?response=json`,
    form: {
      CompanyName: process.env.CW_COMPANY_ID,
      UserName: authorization.name,
      Password: authorization.pass,
      ChkSharedComputer: false,
    },
  }, (err, response, body) => {
    if (err) {
      return next(err);
    }

    let parsed = {};
    try {
      parsed = JSON.parse(body);
    } catch (parseError) {
      // CW server returned jibberish
      return next(parseError);
    }

    // successful login
    if (parsed.Success) {
      return next();
    }
    // send client error message
    res.status(401).json(parsed);
  });
};
