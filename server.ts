import http from "http";
import { promisify } from "util";
import path from "path";
import { to } from "await-to-js";
import UPNPServer from "upnpserver";
import { Server } from "socket.io";

import {
  addTorrent,
  deleteTorrent,
  getActiveTorrents,
  getAllTorrents,
  getRSSFeed,
  startAllTorrents,
  startTorrent,
  stopAllTorrents,
  stopTorrent,
} from "./src/app";

const httpServer = http.createServer();
const server = new Server(httpServer, { serveClient: false });

const PORT = process.env.PORT || 5000;
const HOME_PATH = process.env.HOME || process.env.HOMEPATH;
const DOWNLOAD_DIR = HOME_PATH
  ? path.join(HOME_PATH, "/mz-downloads")
  : undefined;

let isActiveInterval = false;
let torrentsInfo: any;

function emitDownloadInfo() {
  isActiveInterval = true;

  torrentsInfo = setInterval(async function _torrentsInfo() {
    let err, result;
    [err, result] = await to(getAllTorrents());

    if (err) return console.log(err);

    server.emit("torrents", result);
  }, 5000);
}

// async function startDaemon() {
//   const exec = promisify(require('child_process').exec);
//   const command = 'sudo service transmission-daemon start';
//   const { stderr } = await exec(command);

//   console.log('Starting daemon...');

//   if (stderr) return console.log(stderr);

//   console.log('The daemon started successfully.');
// }

server.on("connection", (socket) => {
  if (server.engine.clientsCount === 1 && !isActiveInterval) emitDownloadInfo();

  socket.on("disconnect", () => {
    if (server.engine.clientsCount === 0) {
      clearInterval(torrentsInfo);

      isActiveInterval = false;
    }
  });

  socket.on("add-torrent", addTorrent);

  socket.on("delete-torrent", deleteTorrent);

  socket.on("start-all", startAllTorrents);

  socket.on("stop-all", stopAllTorrents);

  socket.on("stop-torrent", stopTorrent);

  socket.on("start-torrent", startTorrent);
});

getRSSFeed().then(console.log);

// const UPNPServer = new Server({ name: 'MediaZone' }, [
//   {
//     path: DOWNLOAD_DIR,
//     mountPath: '/Videos',
//     type: 'directory',
//   },
// ]);

// startDaemon();

// UPNPServer.start();

server.listen(Number(PORT));

console.log(`Socket-io running on port ${PORT}`);
