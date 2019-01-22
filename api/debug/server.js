const http = require('http')
http.createServer(require('./index')).listen(process.env.PORT || 3000)
