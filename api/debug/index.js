const { parse } = require('get-body')
const serializeError = require('serialize-error')
const getDb = require('./db')

module.exports = async function(req, res) {
  try {
    const body = await parse(req, req.headers, { limit: 1024 * 1024 })
    const batches = (await getDb()).collection('batches')
    const { ops } = await batches.insertOne(body)
    const result = { _id: ops[0]._id, batch: ops[0].batch }
    console.log(result)
    res.end(JSON.stringify(result), 'application/json')
  } catch (e) {
    console.log(e)
    res.statusCode = 400
    res.end(JSON.stringify(serializeError(e)), 'application/json')
  }
}
