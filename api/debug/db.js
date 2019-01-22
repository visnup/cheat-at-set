const MongoClient = require('mongodb').MongoClient

if (!process.env.DB_URL) throw new Error('Missing env DB_URL')

let client = null

module.exports = function getDb() {
  if (client && !client.isConnected) {
    client = null
    console.log('[mongo] client discard')
  }

  if (client === null) {
    client = new MongoClient(process.env.DB_URL)
    console.log('[mongo] client init')
  } else if (client.isConnected) {
    return client.db()
  }

  return new Promise((resolve, reject) => {
    client.connect(err => {
      if (err) {
        client = null
        console.error('[mongo] client err', err)
        return reject(err)
      }

      console.log('[mongo] connected')
      resolve(client.db())
    })
  })
}
