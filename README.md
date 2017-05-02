#cw-micro
This is a sample Express based app that will proxy requests from the ConnectWise Manage API.

## Heroku Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

- Click button
- Open App in Heroku
- Navigate to Settings
- Edit the config vars specified in .env.example
  - CW_COMPANY_ID
  - CW_PUBLIC_KEY
  - CW_PRIVATE_KEY
  - CW_COMPANY_URL

## Local Setup

- Clone repository
- Run `npm install`
- Copy `.env.example` to `.env` and adjust values as needed.
- Run `npm run start` to start the application.

## Development Setup

This repository is configured with developer friendly tools like es6/7 transpiling, eslint, and hot reloading. 

Run the application in development mode with `npm run dev`


### Sample Route

```
    GET /api/cw/time/charge-codes
        Returns a JSON array of time entry charge codes
```

### Authorization

This application utilizes basic authorization against the specified ConnectWise Manage server.
