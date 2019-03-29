const {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} = require('./api')

function createTaskTitle() {
  return Date.now() + '-' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER) + ' Task'
}

function getTasks(server, token, projectId) {
  return apiGet(server, `/api/v1/projects/${projectId}/tasks`, token)
}

const defaultData = { title: createTaskTitle() }

async function createTask(server, token, projectId, data = defaultData) {
  return apiPost(server, `/api/v1/projects/${projectId}/tasks`, token, data)
}

async function getTask(server, token, projectId, taskId) {
  return apiGet(server, `/api/v1/projects/${projectId}/tasks/${taskId}`, token)
}

function patchTask(server, token, projectId, taskId, data = {}) {
  return apiPatch(server, `/api/v1/projects/${projectId}/tasks/${taskId}`, token, data)
}

function removeTask(server, token, projectId, taskId) {
  return apiDelete(server, `/api/v1/projects/${projectId}/tasks/${taskId}`, token)
}

module.exports = {
  createTaskTitle,
  
  getTasks,
  createTask,
  getTask,
  patchTask,
  removeTask,
}
