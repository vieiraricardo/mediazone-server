const http = require('http').createServer()
const server = require('socket.io')(http, { serveClient: false })
const to = require('await-to-js').to
const Server = require('upnpserver')
const PORT = process.env.PORT || 5000
const { DOWNLOAD_DIR } = require('./util')
const {
  addTorrent,
  getAllTorrents,
  deleteTorrent,
  startAllTorrents,
  stopAllTorrents,
  startTorrent,
  stopTorrent
} = require('./app')

let isActiveInterval = false
let torrentsInfo

function emitDownloadInfo () {
  isActiveInterval = true

  torrentsInfo = setInterval(async function () {
    let err, result
    ;[err, result] = await to(getAllTorrents())

    if (err) return console.log(err)

    server.emit('torrents', result)
  }, 5000)
}

// function isTransmissionDaemonOn () {

// }

server.on('connection', socket => {
  if (server.engine.clientsCount === 1 && !isActiveInterval) emitDownloadInfo()

  socket.on('disconnect', () => {
    if (server.engine.clientsCount === 0) {
      clearInterval(torrentsInfo)

      isActiveInterval = false
    }
  })

  socket.on('add-torrent', addTorrent)

  socket.on('delete-torrent', deleteTorrent)

  socket.on('start-all', startAllTorrents)

  socket.on('stop-all', stopAllTorrents)

  socket.on('stop-torrent', stopTorrent)

  socket.on('start-torrent', startTorrent)
})

const UPNPServer = new Server({ name: 'MovieZone' }, [
  {
    path: DOWNLOAD_DIR,
    mountPath: '/TV Shows',
    type: 'directory'
  }
])

UPNPServer.start()

server.listen(PORT)
console.log(`Socket-io running on port ${PORT}`)
