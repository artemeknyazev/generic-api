# Generic API

[![Build Status](https://travis-ci.org/artemeknyazev/generic-api.svg?branch=master)](https://travis-ci.org/artemeknyazev/generic-api)

The intention of this project is to create an API service template. Abstract thinking about an API is good and etc., but some problems can be found only by implementing “real-life” projects, so this API models a simple task management application

## Try it out

[Staging server](https://rocky-beach-70402.herokuapp.com). API endpoints are located at path `/api/v1`. E.g.:

```
> curl -XPOST -i "https://rocky-beach-70402.herokuapp.com/api/v1/signup" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test-2019-04-01-18-38@localhost","password":"password"}'
```

**NOTE:** First query may timeout or take some time because this is a free Heroku dyno

Available API endpoints are described in the [API documentation on SwaggerHub](https://app.swaggerhub.com/apis/artemeknyazev/generic-api). You can also try sending API requests from their build-in tool

## Installation

```
> git clone https://github.com/artemeknyazev/generic-api.git
> cd ./generic-api
> npm install
> export GENERIC_API_MONGO_DB=<path/to/local/mongo/database>
> export GENERIC_API_LOG_MONGO_DB=<path/to/local/mongo/log/database>
# or set `logTransportMongoAllow: false` in ./src/config/development.js to disable logging to MongoDB
> npm run dev # or npm start
```

## Available resources

* [API documentation](https://app.swaggerhub.com/apis/artemeknyazev/generic-api) on SwaggerHub
* [wiki](https://github.com/artemeknyazev/generic-api/wiki) with more details on the project
  * [Service Lifecycle](https://github.com/artemeknyazev/generic-api/wiki/service-lifecycle) describing the startup/shutdown and request handling processes
  * [Business Logic](https://github.com/artemeknyazev/generic-api/wiki/business-logic) of a task management application

## Desired functionality

- [x] validation&sanitization of incoming data
- [ ] separation of API models and DB models
- [x] authentication and authorization
- [x] graceful service shutdown
- [x] API integration tests
- [x] API documentation using OpenAPI v.3

## Technology stack

* Framework: `express`
* DB: MongoDB and `mongoose`
* Validation&sanitization:
  * `joi` for validation schemas
  * `validator` for string validation&sanitization
  * `xss-filters` for string sanitization
* Testing:
  * `jest` as a testing framework
  * `supertest` for API calls abstraction
* Authentication: `jsonwebtoken`, `bcrypt`
* Logging: `winston`
* Process managers:
  * `forever` for production
  * `nodemon` for development
* CI&CD: Travis
* Hosting: Heroku
