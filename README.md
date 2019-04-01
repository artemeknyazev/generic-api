# Generic API

[![Build Status](https://travis-ci.org/artemeknyazev/generic-api.svg?branch=master)](https://travis-ci.org/artemeknyazev/generic-api)

The intention of this project is to create an API service template. Abstract thinking about an API is good and etc., but some problems can be found only by implementing “real-life” projects, so this API models a simple task management application

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
