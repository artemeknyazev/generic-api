const {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} = require('./api')

function createProjectTitle() {
  return Date.now() + '-' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER) + ' Project'
}

function getProjects(server, token) {
  return apiGet(server, '/api/v1/projects', token)
}

const defaultData = { title: createProjectTitle() }

function createProject(server, token, data = defaultData) {
  return apiPost(server, '/api/v1/projects', token, data)
}

function getProject(server, token, projectId) {
  return apiGet(server, `/api/v1/projects/${projectId}`, token)
}

function patchProject(server, token, projectId, data = {}) {
  return apiPatch(server, `/api/v1/projects/${projectId}`, token, data)
}

function removeProject(server, token, projectId) {
  return apiDelete(server, `/api/v1/projects/${projectId}`, token)
}

module.exports = {
  createProjectTitle,
  
  getProjects,
  createProject,
  getProject,
  patchProject,
  removeProject,
}
