const request = require('supertest')
const { signupAndLogin } = require('tests/helpers/setup')
const {
  createProjectTitle,
  getProjects,
  createProject,
  getProject,
  patchProject,
  removeProject,
} = require('tests/helpers/project')

describe('/api/v1/projects', () => {
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

  it('Can\'t access own project list without log in', async () => {
    const res = await request(server)
      .get('/api/v1/projects')
      .send()
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })

  it('Can access own empty project list after sign up and log in', async () => {
    const { token: ownerToken } = await signupAndLogin(server)

    const res = await getProjects(server, ownerToken)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toEqual([])
  })

  it('Can add project', async () => {
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)

    const projectData = { title: createProjectTitle() }
    const res = await createProject(server, ownerToken, projectData)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({ ...projectData, owner: ownerId })
    expect(res.payload).toHaveProperty('id')
  })

  it('Can get own project after creating it', async () => {
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const projectData = { title: createProjectTitle() }
    const { id: projectId } = await createProject(server, ownerToken, projectData)

    const res = await getProject(server, ownerToken, projectId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({
      ...projectData,
      owner: ownerId,
      id: projectId,
    })
  })

  it('Can access own project list as an owner', async () => {
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const project1Data = { title: createProjectTitle() }
    const { id: project1Id } = await createProject(server, ownerToken, project1Data)
    const project2Data = { title: createProjectTitle() }
    const { id: project2Id } = await createProject(server, ownerToken, project2Data)
    const projectDataList = [
      { ...project1Data, owner: ownerId, id: project1Id },
      { ...project2Data, owner: ownerId, id: project2Id },
    ]

    const res = await getProjects(server, ownerToken)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload.length).toEqual(2)
    expect(res.payload).toMatchObject(projectDataList)
  })

  it('Can change own project', async () => {
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectData = { title: createProjectTitle() }
    const { id: projectId } = await createProject(server, ownerToken, createProjectData)

    const patchProjectData = { title: createProjectData.title + '1' }
    const res = await patchProject(server, ownerToken, projectId, patchProjectData)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject(patchProjectData)
  })

  it('Project info change persists', async () => {
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectData = { title: createProjectTitle() }
    const { id: projectId } = await createProject(server, ownerToken, createProjectData)
    const patchProjectData = { title: createProjectData.title + '1' }
    await patchProject(server, ownerToken, projectId, patchProjectData)

    const res = await getProject(server, ownerToken, projectId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject(patchProjectData)
  })

  it('Can remove own project', async () => {
    const { token: ownerToken } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, ownerToken)

    const res = await removeProject(server, ownerToken, projectId)
    expect(res.statusCode).toBe(204)
  })

  it('Can\'t get a removed project', async () => {
    const { token: ownerToken } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, ownerToken)
    await removeProject(server, ownerToken, projectId)

    const getRes = await getProject(server, ownerToken, projectId)
    expect(getRes.statusCode).toBe(404)
  })

  it('Removed project is not displayed in a project list', async () => {
    const { token: ownerToken } = await signupAndLogin(server)
    const { id: project1Id, payload: project1Data } = await createProject(server, ownerToken)
    const { id: project2Id } = await createProject(server, ownerToken)
    await removeProject(server, ownerToken, project2Id)

    const res = await getProjects(server, ownerToken)
    expect(res.statusCode).toBe(200)
    expect(res.payload.length).toEqual(1)
    expect(res.payload).toEqual([ { id: project1Id, ...project1Data } ])
  })

  it('Can get a project as a participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createData = { title: createProjectTitle(), participants: [ participantId ] }
    const { id: projectId } = await createProject(server, ownerToken, createData)

    const res = await getProject(server, participantToken, projectId)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({ ...createData, owner: ownerId })
  })

  it('Can\'t get a project as an outsider', async () => {
    const { token: outsiderToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, ownerToken)

    const res = await getProject(server, outsiderToken, projectId)
    expect(res.statusCode).toBe(403)
    expect(res.status).toBe('error')
  })

  it('Can\'t change a project as a participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectData = { title: createProjectTitle(), participants: [ participantId ] }
    const { id: projectId } = await createProject(server, ownerToken, createProjectData)
    const patchProjectData = { title: createProjectData.title + '1' }

    const res = await patchProject(server, participantToken, projectId, patchProjectData)
    expect(res.statusCode).toBe(403)
    expect(res.status).toBe('error')
  })

  it('Can\'t change a project as an outsider', async () => {
    const { token: outsiderToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createProjectData = { title: createProjectTitle() }
    const { id: projectId } = await createProject(server, ownerToken, createProjectData)
    const patchProjectData = { title: createProjectData.title + '1' }
    const res = await patchProject(server, outsiderToken, projectId, patchProjectData)
    expect(res.statusCode).toBe(403)
    expect(res.status).toBe('error')
  })

  it('Can\'t remove a project as a participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] })

    const removeRes = await removeProject(server, participantToken, projectId)
    expect(removeRes.statusCode).toBe(403)
  })

  it('Can\'t remove a project as an outsider', async () => {
    const { token: outsiderToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const { id: projectId } = await createProject(server, ownerToken)

    const removeRes = await removeProject(server, outsiderToken, projectId)
    expect(removeRes.statusCode).toBe(403)
  })

  it('Can get list of projects containing ones participating in and own ones', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const { id: id1, payload: project1Data } = await createProject(server, ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] })
    const { id: id2, payload: project2Data } = await createProject(server, ownerToken,
      { title: createProjectTitle(), participants: [ participantId ] })
    const { id: id3, payload: project3Data } = await createProject(server, participantToken,
      { title: createProjectTitle(), participants: [] })
    const { id: id4, payload: project4Data } = await createProject(server, participantToken,
      { title: createProjectTitle(), participants: [] })
    const projectDataList = [
      { ...project3Data, owner: participantId, id: id3 },
      { ...project4Data, owner: participantId, id: id4 },
      { ...project1Data, owner: ownerId, id: id1 },
      { ...project2Data, owner: ownerId, id: id2 },
    ]

    const res = await getProjects(server, participantToken)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload.length).toEqual(4)
    expect(res.payload).toMatchObject(projectDataList)
  })

  it('Prevents XSS in the title field', async () => {
    const title = '<script>alert(123)</script>'
    const sanitizedTitle = '&lt;script&gt;alert(123)&lt;&#x2F;script&gt;'
    const { token: ownerToken } = await signupAndLogin(server)

    const res = await createProject(server, ownerToken, { title })
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({ title: sanitizedTitle })
  })

  describe('Prevents adding invalid participant ids', () => {
    it('Can\'t use invalid ObjectID', async () => {
      const { token: ownerToken } = await signupAndLogin(server)
      const res = await createProject(server, ownerToken,
        { title: createProjectTitle(), participants: [ '00000000000' ] })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
    })

    it('Can\'t use XSS content', async () => {
      const { token: ownerToken } = await signupAndLogin(server)
      const res = await createProject(server, ownerToken,
        { title: createProjectTitle(), participants: [ '<script>alert(123)</script>' ] })
      expect(res.statusCode).toBe(400)
      expect(res.status).toBe('error')
    })
  })

  it('Can\'t view not existing project', async () => {
    const { token } = await signupAndLogin(server)
    const res = await getProject(server, token, '000000000000000000000000')
    expect(res.statusCode).toBe(404)
    expect(res.status).toBe('error')
  })
})
