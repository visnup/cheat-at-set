const { json } = require('micro')
const getDb = require('./db')

module.exports = async function(req, res) {
  const batches = (await getDb()).collection('batches')

  if (req.method === 'POST') {
    const body = await json(req)
    const { ops } = await batches.insertOne(body)
    return { _id: ops[0]._id, batch: ops[0].batch }
  } else {
    const batch = await batches
      .find()
      .sort({ _id: -1 })
      .toArray()
    return batch
  }
}
