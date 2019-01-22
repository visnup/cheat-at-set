const { parse } = require('get-body')
const serializeError = require('serialize-error')
const { MongoClient } = require('mongodb')

const client = new MongoClient(process.env.DB_URL)
let batches = null

client.connect(err => {
  if (err) return console.log(err)
  batches = client.db().collection('batches')
})

module.exports = async function(req, res) {
  try {
    const body = await parse(req, req.headers, { limit: 1024 * 1024 })
    if (batches) {
      const { ops } = await batches.insertOne(body)
      const result = { _id: ops[0]._id, batch: ops[0].batch }
      console.log(result)
      res.end(JSON.stringify(result), 'application/json')
    } else {
      res.statusCode = 500
      res.end('{ "error": "no db connection" }', 'application/json')
    }
  } catch (e) {
    console.log(e)
    res.statusCode = 400
    res.end(JSON.stringify(serializeError(e)), 'application/json')
  }
}
