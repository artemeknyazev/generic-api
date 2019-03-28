const request = require('supertest')
const { signupAndLogin } = require('tests/helpers/user')
const {
  createTitle,
  getMany,
  create,
  getOne,
  patchOne,
  removeOne,
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
    const { token } = await signupAndLogin(server)
    const res = await getMany(server, token)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toEqual([])
  })

  it('Can add project', async () => {
    const { id: userId, token } = await signupAndLogin(server)
    const data = { title: createTitle() }
    const res = await create(server, token, data)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({ ...data, owner: userId })
    expect(res.body.payload).toHaveProperty('id')
  })

  it('Can get own project after creating it', async () => {
    const { id: userId, token } = await signupAndLogin(server)
    const createData = { title: createTitle() }
    const createRes = await create(server, token, createData)
    const projectId = createRes.body.payload.id
    const getRes = await getOne(server, token, projectId)
    expect(getRes.status).toBe(200)
    expect(getRes.body.status).toBe('ok')
    expect(getRes.body.payload).toMatchObject({
      ...createData,
      owner: userId,
      id: projectId,
    })
  })

  it('Can access own project list as an owner', async () => {
    const { id: userId, token } = await signupAndLogin(server)
    const createData1 = { title: createTitle() }
    const createRes1 = await create(server, token, createData1)
    const id1 = createRes1.body.payload.id
    const createData2 = { title: createTitle() }
    const createRes2 = await create(server, token, createData2)
    const id2 = createRes2.body.payload.id
    const projectDataList = [
      { ...createData1, owner: userId, id: id1 },
      { ...createData2, owner: userId, id: id2 },
    ]
    const res = await getMany(server, token)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload.length).toEqual(2)
    expect(res.body.payload).toMatchObject(projectDataList)
  })

  it('Can change own project', async () => {
    const { token } = await signupAndLogin(server)
    const createData = { title: createTitle() }
    const createRes = await create(server, token, createData)
    const id = createRes.body.payload.id
    const patchData = { title: createData.title + '1' }
    const patchRes = await patchOne(server, token, id, patchData)
    expect(patchRes.status).toBe(200)
    expect(patchRes.body.status).toBe('ok')
    expect(patchRes.body.payload).toMatchObject(patchData)
  })

  it('Project info change persists between queries', async () => {
    const { token } = await signupAndLogin(server)
    const createData = { title: createTitle() }
    const createRes = await create(server, token, createData)
    const id = createRes.body.payload.id
    const patchData = { title: createData.title + '1' }
    await patchOne(server, token, id, patchData)
    const getRes = await getOne(server, token, id)
    expect(getRes.status).toBe(200)
    expect(getRes.body.status).toBe('ok')
    expect(getRes.body.payload).toMatchObject(patchData)
  })

  it('Can remove own project', async () => {
    const { token } = await signupAndLogin(server)
    const createData = { title: createTitle() }
    const createRes = await create(server, token, createData)
    const id = createRes.body.payload.id
    const removeRes = await removeOne(server, token, id)
    expect(removeRes.status).toBe(204)
  })

  it('Can\'t get project after removing', async () => {
    const { token } = await signupAndLogin(server)
    const createData = { title: createTitle() }
    const createRes = await create(server, token, createData)
    const id = createRes.body.payload.id
    await removeOne(server, token, id)
    const getRes = await getOne(server, token, id)
    expect(getRes.status).toBe(404)
  })

  it('Project is not displayed in project list after removing', async () => {
    const { token } = await signupAndLogin(server)
    const createData1 = { title: createTitle() }
    const createRes1 = await create(server, token, createData1)
    const id1 = createRes1.body.payload.id
    const createData2 = { title: createTitle() }
    const createRes2 = await create(server, token, createData2)
    const id2 = createRes2.body.payload.id
    await removeOne(server, token, id2)
    const getRes = await getMany(server, token)
    expect(getRes.status).toBe(200)
    expect(getRes.body.payload.length).toEqual(1)
    expect(getRes.body.payload).toMatchObject([ { id: id1, ...createData1 } ])
  })

  it('Can get a project as a participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createData = { title: createTitle(), participants: [ participantId ] }
    const createRes = await create(server, ownerToken, createData)
    const projectId = createRes.body.payload.id
    const getRes = await getOne(server, participantToken, projectId)
    expect(getRes.status).toBe(200)
    expect(getRes.body.status).toBe('ok')
    expect(getRes.body.payload).toMatchObject({ ...createData, owner: ownerId })
  })

  it('Can\'t change a project as a participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createData = { title: createTitle(), participants: [ participantId ] }
    const createRes = await create(server, ownerToken, createData)
    const projectId = createRes.body.payload.id
    const patchData = { title: createData.title + '1' }
    const patchRes = await patchOne(server, participantToken, projectId, patchData)
    expect(patchRes.status).toBe(403)
    expect(patchRes.body.status).toBe('error')
  })

  it('Can\'t change a project as not an owner and not a participant', async () => {
    const { token: outsiderToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createData = { title: createTitle(), participants: [] }
    const createRes = await create(server, ownerToken, createData)
    const projectId = createRes.body.payload.id
    const patchData = { title: createData.title + '1' }
    const patchRes = await patchOne(server, outsiderToken, projectId, patchData)
    expect(patchRes.status).toBe(403)
    expect(patchRes.body.status).toBe('error')
  })

  it('Can\'t remove a project as a participant', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createData = { title: createTitle(), participants: [ participantId ] }
    const createRes = await create(server, ownerToken, createData)
    const projectId = createRes.body.payload.id
    const removeRes = await removeOne(server, participantToken, projectId)
    expect(removeRes.status).toBe(403)
  })

  it('Can\'t remove a project as not an owner and not a participant', async () => {
    const { token: outsiderToken } = await signupAndLogin(server)
    const { token: ownerToken } = await signupAndLogin(server)
    const createData = { title: createTitle(), participants: [] }
    const createRes = await create(server, ownerToken, createData)
    const projectId = createRes.body.payload.id
    const removeRes = await removeOne(server, outsiderToken, projectId)
    expect(removeRes.status).toBe(403)
  })

  it('Can get list of projects containing ones participating in and own ones', async () => {
    const { id: participantId, token: participantToken } = await signupAndLogin(server)
    const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
    const createData1 = { title: createTitle(), participants: [ participantId ] }
    const createRes1 = await create(server, ownerToken, createData1)
    const id1 = createRes1.body.payload.id
    const createData2 = { title: createTitle(), participants: [ participantId ] }
    const createRes2 = await create(server, ownerToken, createData2)
    const id2 = createRes2.body.payload.id
    const createData3 = { title: createTitle(), participants: [] }
    const createRes3 = await create(server, participantToken, createData3)
    const id3 = createRes3.body.payload.id
    const createData4 = { title: createTitle(), participants: [] }
    const createRes4 = await create(server, participantToken, createData4)
    const id4 = createRes4.body.payload.id
    const projectDataList = [
      { ...createData3, owner: participantId, id: id3 },
      { ...createData4, owner: participantId, id: id4 },
      { ...createData1, owner: ownerId, id: id1 },
      { ...createData2, owner: ownerId, id: id2 },
    ]
    const getRes = await getMany(server, participantToken)
    expect(getRes.status).toBe(200)
    expect(getRes.body.status).toBe('ok')
    expect(getRes.body.payload.length).toEqual(4)
    expect(getRes.body.payload).toMatchObject(projectDataList)
  })

  it('Prevents XSS in the title field', async () => {
    const title = '<script>alert(123)</script>'
    const sanitizedTitle = '&lt;script&gt;alert(123)&lt;&#x2F;script&gt;'
    const { token } = await signupAndLogin(server)
    const data = { title }
    const sanitizedData = { title: sanitizedTitle }
    const createRes = await create(server, token, data)
    const projectId = createRes.body.payload.id
    expect(createRes.status).toBe(200)
    expect(createRes.body.status).toBe('ok')
    expect(createRes.body.payload).toMatchObject(sanitizedData)
    const getRes = await getOne(server, token, projectId)
    expect(getRes.status).toBe(200)
    expect(getRes.body.status).toBe('ok')
    expect(getRes.body.payload).toMatchObject(sanitizedData)
  })

  it('Prevents adding invalid participant ids', async () => {
    const { token } = await signupAndLogin(server)
    const createRes1 = await create(server, token,
      { title: createTitle(), participants: [ '00000000000' ] })
    expect(createRes1.status).toBe(400)
    expect(createRes1.body.status).toBe('error')
    const createRes2 = await create(server, token,
      { title: createTitle(), participants: [ '<script>alert(123)</script>' ] })
    expect(createRes2.status).toBe(400)
    expect(createRes2.body.status).toBe('error')
  })
})
