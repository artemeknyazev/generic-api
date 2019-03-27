function createSuffix() {
  return Date.now() + '-' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
}

function createEmail() {
  return `${createSuffix()}@test.com`
}

function createPassword() {
  return Date.now().toString()
}

function createName() {
  return Date.now() + ' ' + Date.now()
}

module.exports = {
  createName,
  createEmail,
  createPassword,
}