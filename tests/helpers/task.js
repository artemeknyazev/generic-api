const request = require('supertest')

function createTitle() {
  return Date.now() + '-' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER) + ' Task'
}

function getMany(
  server,
  token,
  projectId,
) {
  return request(server)
    .get(`/api/v1/projects/${projectId}/tasks`)
    .set('x-generic-api-auth-token', token)
    .send()
}

function create(
  server,
  token,
  projectId,
  data = { title: createTitle() },
) {
  return request(server)
    .post(`/api/v1/projects/${projectId}/tasks`)
    .set('x-generic-api-auth-token', token)
    .send(data)
}

function getOne(
  server,
  token,
  projectId,
  taskId,
) {
  return request(server)
    .get(`/api/v1/projects/${projectId}/tasks/${taskId}`)
    .set('x-generic-api-auth-token', token)
    .send()
}

function patchOne(
  server,
  token,
  projectId,
  taskId,
  data = {},
) {
  return request(server)
    .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
    .set('x-generic-api-auth-token', token)
    .send(data)
}

function removeOne(
  server,
  token,
  projectId,
  taskId,
) {
  return request(server)
    .delete(`/api/v1/projects/${projectId}/tasks/${taskId}`)
    .set('x-generic-api-auth-token', token)
    .send()
}

module.exports = {
  createTitle,
  getMany,
  create,
  getOne,
  patchOne,
  removeOne,
}
