const express = require('express');
const router = express.Router();
const WebClient = require('@slack/client').WebClient;
const find = require('lodash').find;

let config;
try {
  config = require('../config.json');
} catch (err) {
  console.error('ERROR: error loading your config.json.');
  console.error(err);
  process.exit(1);
}

const token = process.env.SLACK_API_TOKEN;
if (!token) {
  console.error('SLACK_API_TOKEN must be defined as an environment variable.');
  process.exit(1);
}

const slack = new WebClient(token);

router.post('/api/customer-thermometer/:type/:name', (req, res, next) => {
  const {
    event_id,
    blast_name,
    blast_id,
    blast_date,
    thermometer_name,
    thermometer_id,
    response,
    temperature_id,
    response_date,
    response_delay,
    respnse_icon,
    recipient,
    first_name,
    last_name,
    company,
    comment,
    custom_1,
    custom_2,
    custom_3,
    custom_4,
    custom_5,
    custom_6,
    custom_7,
    custom_8,
    custom_9,
    custom_10,
    ip_address,
    country,
    user_agent,
  } = req.body;

  const {type, name} = req.params;

  return new Promise((resolve, reject) => {
    slack.channels.list((err, info) => {
      if (err) {
        console.error(err);
        return reject(new Error('An error has occurred attempting to look up channels.'));
      }
      if (!info.channels) {
        return reject(new Error('No channel definition returned from Slack API.'));
      }
      return resolve(info);
    });
  })
    .then(({channels}) => {
      return new Promise((resolve, reject) => {
        slack.groups.list((err, info) => {
          if (err) {
            return reject(err);
          }
          return resolve(channels.concat(info.groups));
        });
      });
    })
    .then(info => {
      const metricConfig = find(config, {name});

      if (!metricConfig) {
        console.error('No configuration found matching that metric name.');
        res.status(500).json({msg: 'No configuration found matching that metric name.'});
        return;
      }

      const configSlackChannel = metricConfig.slack_channel.replace(/#/g, '');
      const slackChannelDefinition = find(info, {name: configSlackChannel});

      if (!slackChannelDefinition) {
        console.error('No matching Slack channel found for this metric\'s definition.');
        res.status(500).json({msg: 'No matching Slack channel found for this metric\'s definition.'});
        return;
      }

      console.info(`Posting Slack message to #${configSlackChannel} for ${name}.`);

      slack.chat.postMessage(
        slackChannelDefinition.id,
        `New ${type} response ${response} from ${first_name} ${last_name} at ${company}.`,
        {username: 'CustomerThermometer'},
        (err, header, statusCode, body) => {
          if (err) {
            // do something
            console.error('An error has occurred posting to Slack.', err);
            res.status(500).json({msg: 'An error has occurred posting to Slack.', err});
            return;
          }
          res.status(200).end();
        });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({msg: 'An error has occurred.', error});
    });
});

module.exports = router;
