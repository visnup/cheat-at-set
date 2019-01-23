const { json } = require('micro')
const getDb = require('./db')

module.exports = async function(req) {
  const samples = (await getDb()).collection('samples')

  switch (req.method) {
    case 'POST':
      const body = await json(req)
      const { ops } = await samples.insertOne(body)
      return { _id: ops[0]._id, batch: ops[0].batch }
    case 'GET':
      const sample = await samples
        .find()
        .sort({ _id: -1 })
        .toArray()
      return sample
    default:
      return null
  }
}
