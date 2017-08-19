# slack-customer-thermometer
This is a sample Express based app that will proxy requests from Customer Thermometer to Slack.

## Heroku Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

- Click button
- Open App in Heroku
- Navigate to Settings
- Edit the config vars specified in .env.example
    - SLACK_API_TOKEN
    - CS_USERNAME
    - CS_PASSWORD
- Create a config.json that contains the mappings between Blasts/Thermometers to Slack channels using Heroku Toolbelt. 

## Local Setup

- Clone repository
- Run `npm install`
- Copy `.env.example` to `.env` and adjust values as needed.
- Run `npm run start` to start the application.

## Development Setup

This repository is configured with developer friendly tools like es6/7 transpiling, eslint, and hot reloading. 

Run the application in development mode with `npm run dev`


### Sample Customer Thermometer Response

```json
{
    "event_id": 20397,
    "blast_name": "Your blast name",
    "blast_id": 999,
    "blast_date": "2017-08-17T18:46:59+00:00",
    "thermometer_name": "Your thermometer name",
    "thermometer_id": 111,
    "response_id": 22222,
    "response": "Gold",
    "temperature_id": 1,
    "response_date": "2017-08-18T22:33:39+00:00",
    "response_delay": 1666,
    "response_icon": "<img src=\"https:\/\/app.customerthermometer.com\/sites\/app\/images\/icon_sets\/smileys1\/gold1.jpg\" title=\"Gold\" \/>",
    "recipient": "recipient@example.com",
    "first_name": "Andrew",
    "last_name": "Randall",
    "company": "Customer Thermometer",
    "comment": "This is a comment from a webhook test",
    "custom_1": "Custom 1 data",
    "custom_2": "Custom 2 data",
    "custom_3": "Custom 3 data",
    "custom_4": "Custom 4 data",
    "custom_5": "Custom 5 data",
    "custom_6": "Custom 6 data",
    "custom_7": "Custom 7 data",
    "custom_8": "Custom 8 data",
    "custom_9": "Custom 9 data",
    "custom_10": "Custom 10 data",
    "ip_address": "198.51.100.1",
    "country": "GB",
    "user_agent": "Mozilla\/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/60.0.3112.101 Safari\/537.36"
}
```
