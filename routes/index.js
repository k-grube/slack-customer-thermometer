/* eslint-disable camelcase */
const express = require('express');
const router = express.Router();
const WebClient = require('@slack/client').WebClient;
const find = require('lodash').find;
const findIndex = require('lodash').findIndex;
const path = require('path');

const defaultColors = ['#B17657', '#66CC33', '#FFB40D', '#CC3333'];
const responseTypes = ['Gold', 'Green', 'Yellow', 'Red'];

// yes i know this is dumb, but heroku won't load a manually created config file
// and creating a config file manually is dumb on heroku as it is removed
// whenever a new version of the app is deployed.
let config;
try {
  config = JSON.parse(process.env.CS_CONFIG);
} catch (err) {
  console.error('ERROR: error loading your CS_CONFIG var.');
  console.error(err);
  process.exit(1);
}

const token = process.env.SLACK_API_TOKEN;
if (!token) {
  console.error(
    'ERROR: SLACK_API_TOKEN must be defined as an environment variable.');
  process.exit(1);
}

const {CW_COMPANY_URL, CW_COMPANY_ID} = process.env;

const slack = new WebClient(token);

router.post('/api/customer-thermometer', (req, res, next) => {
  // destruct webhook object
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
    response_icon,
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

  const customFields = [null,
    custom_1,
    custom_2,
    custom_3,
    custom_4,
    custom_5,
    custom_6,
    custom_7,
    custom_8,
    custom_9,
    custom_10];

  const responseIconUrl = response_icon.match(/((http|https).*?)"/)[1];

  if (blast_name === 'Your blast name' &&
    thermometer_name === 'Your thermometer name') {
    res.status(200).json({msg: 'ok'});
    return;
  }

  console.info('Webhook Payload', JSON.stringify(req.body));

  let name = blast_name;
  let type = 'blast';
  if (thermometer_name) {
    type = 'thermometer';
  }
  if (type === 'thermometer') {
    name = thermometer_name;
  }

  let ticketId;
  if (!isNaN(process.env.CS_TICKET_CUSTOM_NUMBER)) {
    ticketId = customFields[process.env.CS_TICKET_CUSTOM_NUMBER];
  }

  let tech;
  if (!isNaN(process.env.CS_TICKET_TECH_NUMBER)) {
    tech = customFields[process.env.CS_TICKET_TECH_NUMBER];
  }

  return new Promise((resolve, reject) => {
    slack.channels.list((err, info) => {
      if (err) {
        console.error(err);
        return reject(
          new Error('An error has occurred attempting to look up channels.'));
      }
      if (!info.channels) {
        return reject(
          new Error('No channel definition returned from Slack API.'));
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
        console.error(
          `No configuration found matching the metric name: ${name}`);
        res.status(500)
          .json({msg: 'No configuration found matching that metric name.'});
        return;
      }

      let limitResponse = false;
      if (metricConfig.limitResponses && metricConfig.limitResponses.length > 0) {
        // search config array for the response type
        // if it's not found, do not post slack message
        if (findIndex(metricConfig.limitResponses, el => el === response) === -1) {
          limitResponse = true;
        }
      }

      if (limitResponse) {
        res.status(200).end();
        return;
      }

      let responseColor;
      if (metricConfig.colors) {
        responseColor = metricConfig.colors[findIndex(responseTypes, el => el === response)];
      } else {
        responseColor = defaultColors[findIndex(responseTypes, el => el === response)];
      }

      let responseRating;
      if (metricConfig.ratings && metricConfig.ratings[response]) {
        responseRating = metricConfig.ratings[response];
      }

      const configSlackChannel = metricConfig.slack_channel.replace(/#/g, '');
      const slackChannelDefinition = find(info, {name: configSlackChannel});

      if (!slackChannelDefinition) {
        console.error(
          'No matching Slack channel found for this metric\'s definition.');
        res.status(500)
          .json(
            {msg: 'No matching Slack channel found for this metric\'s definition.'});
        return;
      }

      console.info(
        `Posting Slack message to #${configSlackChannel} for ${name}.`);

      const message = {
        mrkdwn: true,
        username: 'Customer Thermometer',
        response_type: 'in_channel',
        as_user: false,
        icon_url: 'https://app.customerthermometer.com/images/favicon-196x196.png',
        attachments: [{
          fallback: `New ${type} response ${responseRating} from ${first_name} ${last_name} at ${company}.`,
          thumb_url: responseIconUrl,
          color: responseColor,
          fields: [
            {
              title: 'Company',
              value: company,
              short: true,
            },
            {
              title: 'Recipient',
              value: recipient,
              short: true,
            },
            {
              title: type === 'thermometer' ? 'Thermometer' : 'Blast',
              value: type === 'thermometer' ? thermometer_name : blast_name,
              short: true,
            },
          ],
        }],
      };

      if (ticketId && CW_COMPANY_URL) {
        message.attachments[0].fields.push({
          title: 'Ticket',
          /* eslint-disable max-len */
          value: `<https://${CW_COMPANY_URL}/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&companyName=${CW_COMPANY_ID}&recordType=ServiceFV&recid=${ticketId}|#${ticketId}>`,
          short: true,
        });
      }

      if (tech) {
        message.attachments[0].fields.push({
          title: 'Tech',
          value: tech,
          short: true,
        });
      }

      if (comment && comment.length > 0) {
        message.attachments[0].fields.push({
          title: 'Comment',
          value: comment,
          short: false,
        });
      }

      slack.chat.postMessage(
        slackChannelDefinition.id,
        `New ${type} response *${responseRating}* from ${first_name} ${last_name}.`,
        message,
        (err, header, statusCode, body) => {
          if (err) {
            // do something
            console.error('An error has occurred posting to Slack.', err);
            res.status(500)
              .json({msg: 'An error has occurred posting to Slack.', err});
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
