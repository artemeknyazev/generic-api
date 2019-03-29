module.exports = function ObjectIdFormatMixin(ajv) {
  ajv.addFormat('object-id', /^[a-f\d]{24}$/i)
}
