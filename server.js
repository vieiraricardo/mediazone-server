const http = require('http').createServer();
const { promisify } = require('util');
const server = require('socket.io')(http, { serveClient: false });
const to = require('await-to-js').to;
const Server = require('upnpserver');
const PORT = process.env.PORT || 5000;
const { DOWNLOAD_DIR } = require('./util');
const {
  addTorrent,
  getAllTorrents,
  deleteTorrent,
  startAllTorrents,
  stopAllTorrents,
  startTorrent,
  stopTorrent,
} = require('./app');

let isActiveInterval = false;
let torrentsInfo;

function emitDownloadInfo() {
  isActiveInterval = true;

  torrentsInfo = setInterval(async function _torrentsInfo() {
    let err, result;
    [err, result] = await to(getAllTorrents());

    if (err) return console.log(err);

    server.emit('torrents', result);
  }, 5000);
}

async function startDaemon() {
  const exec = promisify(require('child_process').exec);
  const command = 'sudo service transmission-daemon start';
  const { stderr } = await exec(command);

  console.log('Starting daemon...');

  if (stderr) return console.log(stderr);

  console.log('The daemon started successfully.');
}

server.on('connection', (socket) => {
  if (server.engine.clientsCount === 1 && !isActiveInterval) emitDownloadInfo();

  socket.on('disconnect', () => {
    if (server.engine.clientsCount === 0) {
      clearInterval(torrentsInfo);

      isActiveInterval = false;
    }
  });

  socket.on('add-torrent', addTorrent);

  socket.on('delete-torrent', deleteTorrent);

  socket.on('start-all', startAllTorrents);

  socket.on('stop-all', stopAllTorrents);

  socket.on('stop-torrent', stopTorrent);

  socket.on('start-torrent', startTorrent);
});

const UPNPServer = new Server({ name: 'MediaZone' }, [
  {
    path: DOWNLOAD_DIR,
    mountPath: '/Videos',
    type: 'directory',
  },
]);

startDaemon();

UPNPServer.start();

server.listen(PORT);

console.log(`Socket-io running on port ${PORT}`);
