const request = require('supertest')
const { signupAndLogin } = require('tests/helpers/user')
const {
  createTitle: createProjectTitle,
  create: createProject,
} = require('tests/helpers/project')
const {
  createTitle: createTaskTitle,
  getMany: getManyTasks,
  create: createTask,
  getOne: getOneTask,
  patchOne: patchOneTask,
  removeOne: removeOneTask,
} = require('tests/helpers/task')

xdescribe('/api/v1/projects/:projectId/tasks', () => {
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
    const { token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const res = await request(server)
      .get(`/api/v1/projects/${projectId}`)
      .send()
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })

  it('Can access empty project task list after creating a project as a project owner', async () => {
    const { token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const res = await getManyTasks(server, token, projectId)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toEqual([])
  })

  it('Can add a task to a project as a project owner', async () => {
    const { id: ownerId, token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const data = { title: createTaskTitle(), assignedTo: ownerId }
    const res = await createTask(server, token, projectId, data)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({
      ...data,
      createdBy: ownerId,
      assignedTo: ownerId,
      project: projectId,
    })
    expect(res.body.payload).toHaveProperty('id')
  })

  it('Can add a task to a project as a project participant', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const data = { title: createTaskTitle() }
    const res = await createTask(server, participantToken, projectId, data)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({
      ...data,
      createdBy: participantId,
      project: projectId,
    })
    expect(res.body.payload).toHaveProperty('id')
  })

  it('Can get a task after creating it as a project owner', async () => {
    const { id: ownerId, token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const data = { title: createTaskTitle() }
    const createTaskRes = await createTask(server, token, projectId, data)
    const taskId = createTaskRes.body.payload.id
    const res = await getOneTask(server, token, projectId, taskId)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({
      ...data,
      id: taskId,
      createdBy: ownerId,
      project: projectId,
    })
    expect(res.body.payload).toHaveProperty('id')
  })

  it('Can get a task after creating it as a project participant', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const data = { title: createTaskTitle() }
    const createTaskRes = await createTask(server, participantToken, projectId, data)
    const taskId = createTaskRes.body.payload.id
    const res = await getOneTask(server, participantToken, projectId, taskId)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({
      ...data,
      id: taskId,
      createdBy: ownerId,
      project: projectId,
    })
    expect(res.body.payload).toHaveProperty('id')
  })

  it('Can get a project task list', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const createData1 = { title: createTaskTitle() }
    const createTaskRes1 = await createTask(server, ownerToken, projectId, createData1)
    const id1 = createTaskRes1.body.payload.id
    const createData2 = { title: createTaskTitle() }
    const createTaskRes2 = await createTask(server, participantToken, projectId, createData2)
    const id2 = createTaskRes2.body.payload.id
    const taskDataList = [
      { ...createData1, createdBy: ownerId, id: id1 },
      { ...createData2, createdBy: participantId, id: id2 },
    ]
    const participantRes = await getManyTasks(server, participantToken, projectId)
    expect(participantRes.status).toBe(200)
    expect(participantRes.body.status).toBe('ok')
    expect(participantRes.body.payload.length).toEqual(2)
    expect(participantRes.body.payload).toMatchObject(taskDataList)
    const ownerRes = await getManyTasks(server, ownerToken, projectId)
    expect(ownerRes.status).toBe(200)
    expect(ownerRes.body.status).toBe('ok')
    expect(ownerRes.body.payload.length).toEqual(2)
    expect(ownerRes.body.payload).toMatchObject(taskDataList)
  })

  it('Can get only tasks from a specified project', async () => {
    const { id: ownerId, token: token } = await signupAndLogin(server)
    const createProject1Res = await createProject(server, token)
    const project1Id = createProject1Res.body.payload.id
    const createProject2Res = await createProject(server, token)
    const project2Id = createProject2Res.body.payload.id
    const createData1 = { title: createTaskTitle() }
    const createTaskRes1 = await createTask(server, token, project1Id, createData1)
    const id1 = createTaskRes1.body.payload.id
    const createData2 = { title: createTaskTitle() }
    const createTaskRes2 = await createTask(server, token, project1Id, createData2)
    const id2 = createTaskRes2.body.payload.id
    await createTask(server, token, project2Id)
    await createTask(server, token, project2Id)
    const taskDataList = [
      { ...createData1, createdBy: ownerId, id: id1 },
      { ...createData2, createdBy: ownerId, id: id2 },
    ]
    const res = await getManyTasks(server, token, project1Id)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload.length).toEqual(2)
    expect(res.body.payload).toMatchObject(taskDataList)
  })

  it('Can change a task as a project owner', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const createOwnerTaskData = { title: createTaskTitle() }
    const createOwnerTaskRes = await createTask(server, participantToken, projectId, createOwnerTaskData)
    const ownerTaskId = createOwnerTaskRes.body.payload.id
    const createParticipantTaskData = { title: createTaskTitle() }
    const createParticipantTaskRes = await createTask(server, participantToken, projectId, createParticipantTaskData)
    const participantTaskId = createParticipantTaskRes.body.payload.id

    // Try patching own task
    const patchOwnerTaskData = { title: createOwnerTaskData.title + '1' }
    const resPatchOwnerTask = await patchOneTask(server, ownerToken, projectId, ownerTaskId, patchOwnerTaskData)
    expect(resPatchOwnerTask.status).toBe(200)
    expect(resPatchOwnerTask.body.status).toBe('ok')
    expect(resPatchOwnerTask.body.payload).toMatchObject({
      ...patchOwnerTaskData,
      id: ownerTaskId,
      createdBy: ownerId,
      project: projectId,
    })

    /// Try patching participant's task
    const patchParticipantTaskData = { title: createParticipantTaskData.title + '1' }
    const resPatchParticipantTask = await patchOneTask(server, ownerToken, projectId, participantTaskId, patchParticipantTaskData)
    expect(resPatchParticipantTask.status).toBe(200)
    expect(resPatchParticipantTask.body.status).toBe('ok')
    expect(resPatchParticipantTask.body.payload).toMatchObject({
      ...patchOwnerTaskData,
      id: ownerTaskId,
      createdBy: ownerId,
      project: projectId,
    })
  })

  it('Can change a task as a project participant', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const createOwnerTaskData = { title: createTaskTitle() }
    const createOwnerTaskRes = await createTask(server, participantToken, projectId, createOwnerTaskData)
    const ownerTaskId = createOwnerTaskRes.body.payload.id
    const createParticipantTaskData = { title: createTaskTitle() }
    const createParticipantTaskRes = await createTask(server, participantToken, projectId, createParticipantTaskData)
    const participantTaskId = createParticipantTaskRes.body.payload.id

    // Try patching owner's task
    const patchOwnerTaskData = { title: createOwnerTaskData.title + '1' }
    const resPatchOwnerTask = await patchOneTask(server, participantToken, projectId, ownerTaskId, patchOwnerTaskData)
    expect(resPatchOwnerTask.status).toBe(200)
    expect(resPatchOwnerTask.body.status).toBe('ok')
    expect(resPatchOwnerTask.body.payload).toMatchObject({
      ...patchOwnerTaskData,
      id: ownerTaskId,
      createdBy: ownerId,
      project: projectId,
    })

    /// Try patching own task
    const patchParticipantTaskData = { title: createParticipantTaskData.title + '1' }
    const resPatchParticipantTask = await patchOneTask(server, participantToken, projectId, participantTaskId, patchParticipantTaskData)
    expect(resPatchParticipantTask.status).toBe(200)
    expect(resPatchParticipantTask.body.status).toBe('ok')
    expect(resPatchParticipantTask.body.payload).toMatchObject({
      ...patchOwnerTaskData,
      id: ownerTaskId,
      createdBy: ownerId,
      project: projectId,
    })
  })

  it('Task info change persists', async () => {
    const { id: ownerId, token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const createData = { title: createTaskTitle() }
    const createRes = await createTask(server, token, projectId, createData)
    const taskId = createRes.body.payload.id
    const patchData = { title: createData + '1' }
    await patchOneTask(server, token, projectId, taskId, patchData)
    const res = await getOneTask(server, token, projectId, taskId)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({
      ...patchData,
      id: taskId,
      createdBy: ownerId,
      project: projectId,
    })
  })

  it('Can remove a task as a project owner', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const createOwnerTaskData = { title: createTaskTitle() }
    const createOwnerTaskRes = await createTask(server, participantToken, projectId, createOwnerTaskData)
    const ownerTaskId = createOwnerTaskRes.body.payload.id
    const createParticipantTaskData = { title: createTaskTitle() }
    const createParticipantTaskRes = await createTask(server, participantToken, projectId, createParticipantTaskData)
    const participantTaskId = createParticipantTaskRes.body.payload.id

    // Remove own task
    const removeOwnerTaskRes = await removeOneTask(server, ownerToken, projectId, ownerTaskId)
    expect(removeOwnerTaskRes.status).toBe(204)

    // Remove participant's task
    const removeParticipantTaskRes = await removeOneTask(server, ownerToken, projectId, participantTaskId)
    expect(removeParticipantTaskRes.status).toBe(204)
  })

  it('Can remove a task as a project participant', async () => {
    const { id: participantId, participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id
    const createOwnerTaskData = { title: createTaskTitle() }
    const createOwnerTaskRes = await createTask(server, participantToken, projectId, createOwnerTaskData)
    const ownerTaskId = createOwnerTaskRes.body.payload.id
    const createParticipantTaskData = { title: createTaskTitle() }
    const createParticipantTaskRes = await createTask(server, participantToken, projectId, createParticipantTaskData)
    const participantTaskId = createParticipantTaskRes.body.payload.id

    // Remove owner's task
    const removeOwnerTaskRes = await removeOneTask(server, participantToken, projectId, ownerTaskId)
    expect(removeOwnerTaskRes.status).toBe(204)

    // Remove own task
    const removeParticipantTaskRes = await removeOneTask(server, participantToken, projectId, participantTaskId)
    expect(removeParticipantTaskRes.status).toBe(204)
  })

  it('Can\'t get a task after removing', async () => {
    const { token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const createRes = await createTask(server, token, projectId)
    const taskId = createRes.body.payload.id
    await removeOneTask(server, token, projectId, taskId)
    const res = await getOneTask(server, token, projectId, taskId)
    expect(res.status).toBe(404)
  })

  it('Task is not displayed in a project task list after removing', async () => {
    const { token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const create1Res = await createTask(server, token, projectId)
    const create2Res = await createTask(server, token, projectId)
    const task2Id = create2Res.body.payload.id
    await removeOneTask(server, token, projectId, task2Id)
    const res = await getManyTasks(server, token, projectId)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload.length).toEqual(2)
    expect(res.body.payload).toMatchObject([ create1Res.body.payload ])
  })

  it('Prevents XSS in the title field', async () => {
    const title = '<script>alert(123)</script>'
    const sanitizedTitle = '&lt;script&gt;alert(123)&lt;&#x2F;script&gt;'
    const { token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const res = await createTask(server, token, projectId, { title })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toHaveProperty('title', sanitizedTitle)
  })

  it('Prevents adding invalid assignee id', async () => {
    const { token } = await signupAndLogin(server)
    const createProjectRes = await createProject(server, token)
    const projectId = createProjectRes.body.payload.id
    const createRes1 = await createTask(server, token, projectId,
      { title: createTaskTitle(), assignedTo: '00000000000' })
    expect(createRes1.status).toBe(400)
    expect(createRes1.body.status).toBe('error')
    const createRes2 = await createTask(server, token, projectId,
      { title: createTaskTitle(), assignedTo: '<script>alert(123)</script>' })
    expect(createRes2.status).toBe(400)
    expect(createRes2.body.status).toBe('error')
  })

  it('Can assign users to tasks as a project owner', async () => {
    const { id: participantId } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id

    // Can create task with assignment to self
    const createRes1 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: ownerId })
    expect(createRes1.status).toBe(200)
    expect(createRes1.body.status).toBe('ok')
    expect(createRes1.body.payload).toHaveProperty('assignedTo', ownerId)

    // Can create task with assignment to other
    const createRes2 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: participantId })
    expect(createRes2.status).toBe(200)
    expect(createRes2.body.status).toBe('ok')
    expect(createRes2.body.payload).toHaveProperty('assignedTo', participantId)

    // Can create task without assignment and assign to self
    const createRes3 = await createTask(server, ownerToken, projectId)
    const task3Id = createRes3.body.payload.id
    const patchRes3 = await patchOneTask(server, ownerToken, projectId, task3Id,
      { assignedTo: ownerId })
    expect(patchRes3.status).toBe(200)
    expect(patchRes3.body.status).toBe('ok')
    expect(patchRes3.body.payload).toHaveProperty('assignedTo', ownerId)

    // Can create task without assignment and assign to other
    const createRes4 = await createTask(server, ownerToken, projectId)
    const task4Id = createRes4.body.payload.id
    const patchRes4 = await patchOneTask(server, ownerToken, projectId, task4Id,
      { assignedTo: participantId })
    expect(patchRes4.status).toBe(200)
    expect(patchRes4.body.status).toBe('ok')
    expect(patchRes4.body.payload).toHaveProperty('assignedTo', participantId)

    // Can reassign to self
    const createRes5 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: participantId })
    const task5Id = createRes5.body.payload.id
    const patchRes5 = await patchOneTask(server, ownerToken, projectId, task5Id,
      { assignedTo: ownerId })
    expect(patchRes5.status).toBe(200)
    expect(patchRes5.body.status).toBe('ok')
    expect(patchRes5.body.payload).toHaveProperty('assignedTo', ownerId)

    // Can reassign to other
    const createRes6 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: ownerId })
    const task6Id = createRes6.body.payload.id
    const patchRes6 = await patchOneTask(server, ownerToken, projectId, task6Id,
      { assignedTo: participantId })
    expect(patchRes6.status).toBe(200)
    expect(patchRes6.body.status).toBe('ok')
    expect(patchRes6.body.payload).toHaveProperty('assignedTo', ownerId)
  })

  it('Can assign users to tasks as a project participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id

    // Can create task with assignment to other
    const createRes1 = await createTask(server, participantToken, projectId,
      { title: createTaskTitle(), assignedTo: ownerId })
    expect(createRes1.status).toBe(200)
    expect(createRes1.body.status).toBe('ok')
    expect(createRes1.body.payload).toHaveProperty('assignedTo', ownerId)

    // Can create task with assignment to self
    const createRes2 = await createTask(server, participantToken, projectId,
      { title: createTaskTitle(), assignedTo: participantId })
    expect(createRes2.status).toBe(200)
    expect(createRes2.body.status).toBe('ok')
    expect(createRes2.body.payload).toHaveProperty('assignedTo', participantId)

    // Can create task without assignment and assign to other
    const createRes3 = await createTask(server, participantToken, projectId)
    const task3Id = createRes3.body.payload.id
    const patchRes3 = await patchOneTask(server, participantToken, projectId, task3Id,
      { assignedTo: ownerId })
    expect(patchRes3.status).toBe(200)
    expect(patchRes3.body.status).toBe('ok')
    expect(patchRes3.body.payload).toHaveProperty('assignedTo', ownerId)

    // Can create task without assignment and assign to self
    const createRes4 = await createTask(server, participantToken, projectId)
    const task4Id = createRes4.body.payload.id
    const patchRes4 = await patchOneTask(server, participantToken, projectId, task4Id,
      { assignedTo: participantId })
    expect(patchRes4.status).toBe(200)
    expect(patchRes4.body.status).toBe('ok')
    expect(patchRes4.body.payload).toHaveProperty('assignedTo', participantId)

    // Can reassign to other
    const createRes5 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: participantId })
    const task5Id = createRes5.body.payload.id
    const patchRes5 = await patchOneTask(server, ownerToken, projectId, task5Id,
      { assignedTo: ownerId })
    expect(patchRes5.status).toBe(200)
    expect(patchRes5.body.status).toBe('ok')
    expect(patchRes5.body.payload).toHaveProperty('assignedTo', ownerId)

    // Can reassign to self
    const createRes6 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: ownerId })
    const task6Id = createRes6.body.payload.id
    const patchRes6 = await patchOneTask(server, ownerToken, projectId, task6Id,
      { assignedTo: participantId })
    expect(patchRes6.status).toBe(200)
    expect(patchRes6.body.status).toBe('ok')
    expect(patchRes6.body.payload).toHaveProperty('assignedTo', ownerId)
  })

  it('Can\'t assign not a project participant and not a project owner to a task', async () => {
    const { id: outsiderId } = await signupAndLogin(server)
    const { id: participantId } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectRes = await createProject(
      server,
      ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] }
    )
    const projectId = createProjectRes.body.payload.id

    // Can't create a task with an assignment to an outsider
    const createRes1 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: outsiderId })
    expect(createRes1.status).toBe(200)
    expect(createRes1.body.status).toBe('error')

    // Can't assign an outsider to an already created task
    const createRes2 = await createTask(server, ownerToken, projectId)
    const task2Id = createRes2.body.payload.id
    const patchRes2 = await patchOneTask(server, ownerToken, projectId, task2Id,
      { assignedTo: outsiderId })
    expect(patchRes2.status).toBe(200)
    expect(patchRes2.body.status).toBe('ok')

    // Can't reassign a task to an outsider
    const createRes3 = await createTask(server, ownerToken, projectId,
      { title: createTaskTitle(), assignedTo: participantId })
    const task3Id = createRes3.body.payload.id
    const patchRes3 = await patchOneTask(server, ownerToken, projectId, task3Id,
      { assignedTo: outsiderId })
    expect(patchRes3.status).toBe(200)
    expect(patchRes3.body.status).toBe('error')
  })
})
