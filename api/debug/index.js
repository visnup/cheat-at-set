const { Buffer } = require('buffer')
const { createError, json } = require('micro')
const { parse } = require('url')
const { ObjectID } = require('mongodb')
const getDb = require('./db')

module.exports = async function(req, res) {
  const samples = (await getDb()).collection('samples')

  switch (req.method) {
    case 'POST': {
      const body = await json(req)
      const { ops } = await samples.insertOne(body)
      return { _id: ops[0]._id, batch: ops[0].batch }
    }
    case 'GET': {
      const id = parse(req.url, true).query.id
      if (id) {
        const sample = await samples
          .findOne({ _id: ObjectID.createFromHexString(id) })
        if (!sample) throw createError(404)
        res.setHeader('content-type', 'image/png')
        const base64 = sample.image.replace('data:image/png;base64,', '')
        return Buffer.from(base64, 'base64')
      } else {
        return (await samples
          .find({}, { projection: { image: 0 } })
          .sort({ _id: -1 })
          .toArray())
          .map(s => ({ ...s, image: `/api/debug?id=${s._id}` }))
      }
    }
    case 'DELETE': {
      const batch = +parse(req.url, true).query.batch
      return await samples.deleteMany({ batch })
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
      throw createError(405)
  }
}
