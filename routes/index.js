const express = require('express');
const router = express.Router();

const ConnectWise = require('connectwise-rest');
const cw = new ConnectWise({
  companyId: process.env.CW_COMPANY_ID,
  publicKey: process.env.CW_PUBLIC_KEY,
  privateKey: process.env.CW_PRIVATE_KEY,
  companyUrl: process.env.CW_COMPANY_URL,
});

router.get('/api/cw/time/charge-codes', (req, res, next) => {
  cw.SystemAPI.Reports.getReport('ChargeCode')
    .then(report => res.json(report))
    .catch(err => next(err));
});

module.exports = router;
