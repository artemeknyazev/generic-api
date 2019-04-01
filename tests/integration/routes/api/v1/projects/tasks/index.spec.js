const request = require('supertest')
const { createProject } = require('tests/helpers/project')
const {
  createTaskTitle,
  getTasks,
  createTask,
  getTask,
  patchTask,
  removeTask,
} = require('tests/helpers/task')
const {
  signupAndLogin,
  setupProject,
  setupProjectWithParticipant,
  setupProjectWithParticipantAndOutsider,
} = require('tests/helpers/setup')

describe('/api/v1/projects/:projectId/tasks', () => {
  // --- Integration tests preamble start --
  let server = null
  let shutdown = null
  beforeEach((done) => {
    const config = require('src/config')
    const bootstrap = require('src/bootstrap')
    bootstrap(config).then(result => {
      server = result.testServer
      shutdown = result.shutdown
      done()
    })
  })
  afterEach((done) => {
    shutdown().then(() => done())
  })
  // --- Integration tests preamble end --

  it('Can\'t access own project\'s task list without log in', async () => {
    const { projectId } = await setupProject(server)

    const res = await request(server)
      .get(`/api/v1/projects/${projectId}/tasks`)
      .send()
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      'Unauthorized',
    ])
  })

  it('Can access empty project task list after creating a project as a project owner', async () => {
    const { projectId, ownerToken } = await setupProject(server)

    const res = await getTasks(server, ownerToken, projectId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toEqual([])
  })

  it('Can add a task to a project as a project owner', async () => {
    const { projectId, ownerToken, ownerId } = await setupProject(server)
    const data = { title: createTaskTitle(), assignedTo: ownerId }

    const res = await createTask(server, ownerToken, projectId, data)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({
      ...data,
      createdBy: ownerId,
      assignedTo: ownerId,
      project: projectId,
    })
    expect(res.payload).toHaveProperty('id')
  })

  it('Can add a task to a project as a project participant', async () => {
    const { projectId, participantToken, participantId } = await setupProjectWithParticipant(server)
    const data = { title: createTaskTitle() }

    const res = await createTask(server, participantToken, projectId, data)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({
      ...data,
      createdBy: participantId,
      project: projectId,
    })
    expect(res.payload).toHaveProperty('id')
  })

  it('Can get a task after creating it as a project owner', async () => {
    const { projectId, ownerToken, ownerId } = await setupProject(server)
    const data = { title: createTaskTitle() }
    const { id: taskId } = await createTask(server, ownerToken, projectId, data)

    const res = await getTask(server, ownerToken, projectId, taskId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({
      ...data,
      id: taskId,
      createdBy: ownerId,
      project: projectId,
    })
    expect(res.payload).toHaveProperty('id')
  })

  it('Can get a task after creating it as a project participant', async () => {
    const { projectId, participantToken, participantId } = await setupProjectWithParticipant(server)
    const data = { title: createTaskTitle() }
    const { id: taskId } = await createTask(server, participantToken, projectId, data)

    const res = await getTask(server, participantToken, projectId, taskId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({
      ...data,
      id: taskId,
      createdBy: participantId,
      project: projectId,
    })
    expect(res.payload).toHaveProperty('id')
  })

  describe('Can get a project task list', () => {
    async function setup(server) {
      const { ownerId, ownerToken, projectId, participantToken, participantId } = await setupProjectWithParticipant(server)
      const task1Data = { title: createTaskTitle() }
      const { id: task1Id } = await createTask(server, ownerToken, projectId, task1Data)
      const task2Data = { title: createTaskTitle() }
      const { id: task2Id } = await createTask(server, participantToken, projectId, task2Data)
      const taskDataList = [
        { ...task1Data, createdBy: ownerId, id: task1Id },
        { ...task2Data, createdBy: participantId, id: task2Id },
      ]
      return { taskDataList, participantToken, ownerToken, projectId }
    }

    it('As a participant', async () => {
      const { participantToken, projectId, taskDataList } = await setup(server)

      const res = await getTasks(server, participantToken, projectId)
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload.length).toEqual(2)
      expect(res.payload).toMatchObject(taskDataList)
    })

    it('As an owner', async () => {
      const { ownerToken, projectId, taskDataList } = await setup(server)

      const res = await getTasks(server, ownerToken, projectId)
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload.length).toEqual(2)
      expect(res.payload).toMatchObject(taskDataList)
    })
  })

  it('Can get only tasks from a specified project', async () => {
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const { id: project1Id } = await createProject(server, ownerToken)
    const { id: project2Id } = await createProject(server, ownerToken)
    const task1Data = { title: createTaskTitle() }
    const { id: task1Id } = await createTask(server, ownerToken, project1Id, task1Data)
    const task2Data = { title: createTaskTitle() }
    const { id: task2Id } = await createTask(server, ownerToken, project1Id, task2Data)
    await createTask(server, ownerToken, project2Id)
    await createTask(server, ownerToken, project2Id)
    const taskDataList = [
      { ...task1Data, createdBy: ownerId, id: task1Id },
      { ...task2Data, createdBy: ownerId, id: task2Id },
    ]

    const res = await getTasks(server, ownerToken, project1Id)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload.length).toEqual(2)
    expect(res.payload).toMatchObject(taskDataList)
  })

  describe('Can change a task as a project owner', () => {
    it('Can patch own task', async () => {
      const { ownerToken, participantToken, projectId, participantId } = await setupProjectWithParticipant(server)
      const createTaskData = { title: createTaskTitle() }
      const { id: taskId } = await createTask(server, participantToken, projectId, createTaskData)

      const patchTaskData = { title: createTaskData.title + '1' }
      const res = await patchTask(server, ownerToken, projectId, taskId, patchTaskData)
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toMatchObject({
        ...patchTaskData,
        id: taskId,
        createdBy: participantId,
        project: projectId,
      })
    })

    it('Can patch participant\'s task', async () => {
      const { ownerToken, participantToken, projectId, participantId } = await setupProjectWithParticipant(server)
      const createTaskData = { title: createTaskTitle() }
      const { id: taskId } = await createTask(server, participantToken, projectId, createTaskData)

      const patchTaskData = { title: createTaskData.title + '1' }
      const res = await patchTask(server, ownerToken, projectId, taskId, patchTaskData)
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toMatchObject({
        ...patchTaskData,
        id: taskId,
        createdBy: participantId,
        project: projectId,
      })
    })
  })

  describe('Can change a task as a project participant', () => {
    it('Can patch owner\'s task', async () => {
      const { ownerToken, participantToken, ownerId, projectId } = await setupProjectWithParticipant(server)
      const createTaskData = { title: createTaskTitle() }
      const { id: taskId } = await createTask(server, ownerToken, projectId, createTaskData)

      const patchTaskData = { title: createTaskData.title + '1' }
      const res = await patchTask(server, participantToken, projectId, taskId, patchTaskData)
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toMatchObject({
        ...patchTaskData,
        id: taskId,
        createdBy: ownerId,
        project: projectId,
      })
    })

    it('Can patch own task', async () => {
      const { participantToken, participantId, projectId } = await setupProjectWithParticipant(server)
      const createTaskData = { title: createTaskTitle() }
      const { id: participantTaskId } = await createTask(server, participantToken, projectId, createTaskData)

      const patchTaskData = { title: createTaskData.title + '1' }
      const res = await patchTask(server, participantToken, projectId, participantTaskId, patchTaskData)
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toMatchObject({
        ...patchTaskData,
        id: participantTaskId,
        createdBy: participantId,
        project: projectId,
      })
    })
  })

  it('Task info change persists', async () => {
    const { projectId, ownerToken, ownerId } = await setupProject(server)
    const createData = { title: createTaskTitle() }
    const { id: taskId } = await createTask(server, ownerToken, projectId, createData)
    const patchData = { title: createData + '1' }
    await patchTask(server, ownerToken, projectId, taskId, patchData)

    const res = await getTask(server, ownerToken, projectId, taskId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({
      ...patchData,
      id: taskId,
      createdBy: ownerId,
      project: projectId,
    })
  })

  describe('Can remove a task as a project owner', () => {
    it('Can remove own task', async () => {
      const { participantToken, ownerToken, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, participantToken, projectId)

      const res = await removeTask(server, ownerToken, projectId, taskId)
      expect(res.statusCode).toBe(204)
    })

    it('Can remove participant\'s task', async () => {
      const { participantToken, ownerToken, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, participantToken, projectId)

      const res = await removeTask(server, ownerToken, projectId, taskId)
      expect(res.statusCode).toBe(204)
    })
  })

  describe('Can remove a task as a project participant', () => {
    it('Can remove owner\'s task', async () => {
      const { participantToken, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, participantToken, projectId)

      const res = await removeTask(server, participantToken, projectId, taskId)
      expect(res.statusCode).toBe(204)
    })

    it('Can remove own task', async () => {
      const { participantToken, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, participantToken, projectId)

      const res = await removeTask(server, participantToken, projectId, taskId)
      expect(res.statusCode).toBe(204)
    })
  })

  it('Can\'t get a task after removing', async () => {
    const { projectId, ownerToken } = await setupProject(server)
    const { id: taskId } = await createTask(server, ownerToken, projectId)
    await removeTask(server, ownerToken, projectId, taskId)

    const res = await getTask(server, ownerToken, projectId, taskId)
    expect(res.statusCode).toBe(404)
    expect(res.status).toBe('error')
    expect(res.payload).toEqual([
      'Task not found',
    ])
  })

  it('Removed task is not displayed in a project task list', async () => {
    const { projectId, ownerToken } = await setupProject(server)
    const { payload: task1Data } = await createTask(server, ownerToken, projectId)
    const { id: task2Id } = await createTask(server, ownerToken, projectId)
    await removeTask(server, ownerToken, projectId, task2Id)

    const res = await getTasks(server, ownerToken, projectId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload.length).toEqual(1)
    expect(res.payload).toMatchObject([ task1Data ])
  })

  it('Prevents XSS in the title field', async () => {
    const { projectId, ownerToken } = await setupProject(server)
    const title = '<script>alert(123)</script>'
    const sanitizedTitle = '&lt;script&gt;alert(123)&lt;&#x2F;script&gt;'

    const res = await createTask(server, ownerToken, projectId, { title })
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toHaveProperty('title', sanitizedTitle)
  })

  describe('Prevents adding invalid assignee id', () => {
    it('Can\'t use invalid ObjectID', async () => {
      const { projectId, ownerToken } = await setupProject(server)

      const res = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: '00000000000' })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        '"assignedTo" must be a valid MongoDB ObjectId',
      ])
    })

    it('Can\'t use XSS content', async () => {
      const { projectId, ownerToken } = await setupProject(server)

      const res = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: '<script>alert(123)</script>' })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        '"assignedTo" must be a valid MongoDB ObjectId',
      ])
    })
  })

  describe('Can assign users to tasks as a project owner', () => {
    it('Can create task with assignment to self', async () => {
      const { ownerToken, ownerId, projectId } = await setupProjectWithParticipant(server)

      const res = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: ownerId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', ownerId)
    })

    it('Can create task with assignment to other', async () => {
      const { ownerToken, participantId, projectId } = await setupProjectWithParticipant(server)

      const res = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: participantId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', participantId)
    })

    it('Can create task without assignment and assign to self', async () => {
      const { ownerToken, ownerId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId)

      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: ownerId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', ownerId)
    })

    it('Can create task without assignment and assign to other', async () => {
      const { ownerToken, participantId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId)

      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: participantId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', participantId)
    })

    it('Can reassign to self', async () => {
      const { ownerToken, ownerId, participantId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: participantId })

      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: ownerId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', ownerId)
    })

    it('Can reassign to other', async () => {
      const { ownerToken, ownerId, participantId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: ownerId })

      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: participantId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', participantId)
    })
  })

  describe('Can assign users to tasks as a project participant', () => {
    it('Can create a task assigned to other', async () => {
      const { participantToken, ownerId, projectId } = await setupProjectWithParticipant(server)

      const res = await createTask(server, participantToken, projectId,
        { title: createTaskTitle(), assignedTo: ownerId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', ownerId)
    })

    it('Can create a task assigned to self', async () => {
      const { participantToken, participantId, projectId } = await setupProjectWithParticipant(server)

      const res = await createTask(server, participantToken, projectId,
        { title: createTaskTitle(), assignedTo: participantId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', participantId)
    })

    it('Can create a task without assignment and assign to other', async () => {
      const { participantToken, ownerId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, participantToken, projectId)

      const res = await patchTask(server, participantToken, projectId, taskId,
        { assignedTo: ownerId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', ownerId)
    })

    it('Can create a task without assignment and assign to self', async () => {
      const { participantToken, participantId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, participantToken, projectId)

      const res = await patchTask(server, participantToken, projectId, taskId,
        { assignedTo: participantId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', participantId)
    })

    it('Can reassign task to other', async () => {
      const { ownerToken, ownerId, participantId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: participantId })
      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: ownerId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', ownerId)
    })

    it('Can reassign task to self', async () => {
      const { ownerToken, ownerId, participantId, projectId } = await setupProjectWithParticipant(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: ownerId })

      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: participantId })
      expect(res.statusCode).toBe(200)
      expect(res.status).toBe('ok')
      expect(res.payload).toHaveProperty('assignedTo', participantId)
    })
  })

  describe('Can\'t assign to an outsider', () => {
    it('Can\'t create a task with an assignment to an outsider', async () => {
      const { ownerToken, projectId, outsiderId } = await setupProjectWithParticipantAndOutsider(server)

      const res = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: outsiderId })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        `User '${outsiderId}' is not authorized to be assigned to tasks in the project '${projectId}'`,
      ])
    })

    it('Can\'t assign an outsider to an already created task', async () => {
      const { ownerToken, projectId, outsiderId } = await setupProjectWithParticipantAndOutsider(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId)

      const res = await patchTask(server, ownerToken, projectId, taskId,
        { assignedTo: outsiderId })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        `User '${outsiderId}' is not authorized to be assigned to tasks in the project '${projectId}'`,
      ])
    })

    it('Can\'t reassign a task to an outsider', async () => {
      const { ownerToken, projectId, outsiderId, participantId } = await setupProjectWithParticipantAndOutsider(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: participantId })

      const res = await patchTask(server, ownerToken, projectId, taskId, { assignedTo: outsiderId })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        `User '${outsiderId}' is not authorized to be assigned to tasks in the project '${projectId}'`,
      ])
    })
  })

  it('Can\'t view a project task list as an outsider', async () => {
    const { ownerToken, participantToken, outsiderToken, projectId } = await setupProjectWithParticipantAndOutsider(server)
    await createTask(server, ownerToken, projectId)
    await createTask(server, participantToken, projectId)

    const res = await getTasks(server, outsiderToken, projectId)
    expect(res.statusCode).toBe(403)
    expect(res.status).toBe('error')
    expect(res.payload).toEqual([
      'Forbidden',
    ])
  })

  it('Can\'t view a task as an outsider', async () => {
    const { ownerToken, participantToken, outsiderToken, projectId } = await setupProjectWithParticipantAndOutsider(server)
    const { id: task1Id } = await createTask(server, ownerToken, projectId)
    const { id: task2Id } = await createTask(server, participantToken, projectId)

    const res1 = await getTask(server, outsiderToken, projectId, task1Id)
    expect(res1.statusCode).toBe(403)
    expect(res1.status).toBe('error')
    expect(res1.payload).toEqual([
      'Forbidden',
    ])

    const res2 = await getTask(server, outsiderToken, projectId, task2Id)
    expect(res2.statusCode).toBe(403)
    expect(res2.status).toBe('error')
    expect(res2.payload).toEqual([
      'Forbidden',
    ])
  })

  it('Can\'t view not existing task', async () => {
    const { token } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, token)

    const res = await getTask(server, token, projectId, '000000000000000000000000')
    expect(res.statusCode).toBe(404)
    expect(res.status).toBe('error')
    expect(res.payload).toEqual([
      'Task not found',
    ])
  })

  it('Can\'t view a project when providing invalid id', async () => {
    const { token } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, token)

    const res = await getTask(server, token, projectId, '{ __proto__:{} }')
    expect(res.statusCode).toBe(400)
    expect(res.status).toBe('error')
    expect(res.payload).toEqual([
      'Invalid task id',
    ])
  })

  describe('Can\'t assign a task to a nonexistent user', () => {
    it('When creating a task', async () => {
      const { projectId, ownerToken } = await setupProject(server)

      const res = await createTask(server, ownerToken, projectId,
        { title: createTaskTitle(), assignedTo: '000000000000000000000000' })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        'User \'000000000000000000000000\' does not exist',
      ])
    })

    it('When patching a task', async () => {
      const { projectId, ownerToken } = await setupProject(server)
      const { id: taskId } = await createTask(server, ownerToken, projectId)

      const res = await patchTask(server, ownerToken, projectId, taskId,
        { assignedTo: '000000000000000000000000' })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
      expect(res.payload).toEqual([
        'User \'000000000000000000000000\' does not exist',
      ])
    })
  })
})
