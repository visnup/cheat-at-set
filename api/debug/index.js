const { json } = require('micro')
const { parse } = require('url')
const { ObjectID } = require('mongodb')
const getDb = require('./db')

module.exports = async function(req) {
  const samples = (await getDb()).collection('samples')

  switch (req.method) {
    case 'POST': {
      const body = await json(req)
      const { ops } = await samples.insertOne(body)
      return { _id: ops[0]._id, batch: ops[0].batch }
    }
    case 'GET': {
      const sample = await samples
        .find()
        .sort({ _id: -1 })
        .toArray()
      return sample
    }
    case 'DELETE': {
      const batch = +parse(req.url, true).query.batch
      await samples.deleteMany({ batch })
    }
    case 'PATCH': {
      const id = ObjectID.createFromHexString(parse(req.url, true).query.id)
      const sample = await samples.findOne({ _id: id })
      await samples.updateMany(
        { batch: sample.batch, correct: true },
        {
          $unset: { correct: '' },
        }
      )
      await samples.updateOne({ _id: id }, { $set: { correct: true } })
      return sample
    }
    default:
      return null
  }
}
