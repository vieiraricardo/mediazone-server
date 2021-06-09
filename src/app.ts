import fetch from "node-fetch";
import parser from "fast-xml-parser";
import bluebird from "bluebird";
import Transmission from "transmission";

import { DOWNLOAD_DIR } from "./utils";

const transmission = new Transmission({
  port: 9091,
  username: "transmission",
  password: "transmission",
  "download-dir": DOWNLOAD_DIR,
});

bluebird.promisifyAll(transmission);

export async function addTorrent(url) {
  await transmission.addUrl(url, (err) => {
    if (err) return console.log(err);
  });
}

export function deleteTorrent(id) {
  transmission.remove(id, true, (err, result) => {
    if (err) return console.log(err);
    console.log(result);
  });
}

export async function getAllTorrents() {
  const torrents = await transmission.getAsync().then((result) =>
    result.torrents.map((torrent) => ({
      id: torrent.id,
      name: torrent.name,
      rateDownload: torrent.rateDownload / 1000,
      completed: torrent.percentDone * 100,
      eta: torrent.eta / 3600,
      status: getStatusType(torrent.status),
    })),
  );

  return torrents;
}

export function startAllTorrents() {
  getActiveTorrents().then((torrents) =>
    torrents.forEach((torrent) => startTorrent(torrent.id)),
  );
}

export function stopAllTorrents() {
  getActiveTorrents().then((torrents) =>
    torrents.forEach((torrent) => stopTorrent(torrent.id)),
  );
}

export function startTorrent(id) {
  transmission.start(id, (err) => {
    if (err) return console.log(err);
  });
}

export function stopTorrent(id) {
  transmission.stop(id, (err) => {
    if (err) return console.log(err);
  });
}

export async function getActiveTorrents() {
  const torrents = await transmission.activeAsync().then((result) =>
    result.torrents.map((torrent) => ({
      name: torrent.name,
      id: torrent.id,
    })),
  );
  return torrents;
}

function getStatusType(type) {
  if (type === 0) {
    return "STOPPED";
  } else if (type === 1) {
    return "CHECK_WAIT";
  } else if (type === 2) {
    return "CHECK";
  } else if (type === 3) {
    return "DOWNLOAD_WAIT";
  } else if (type === 4) {
    return "DOWNLOAD";
  } else if (type === 5) {
    return "SEED_WAIT";
  } else if (type === 6) {
    return "SEED";
  } else if (type === 7) {
    return "ISOLATED";
  }
}

export const getRSSFeed = async () => {
  const xml = await fetch("https://eztv.re/ezrss.xml")
    .then((res) => res.text())
    .then((xml) =>
      parser.parse(xml, { ignoreNameSpace: true, trimValues: true }),
    );

  const feed = await xml.rss.channel.item.map((t) => ({
    name: t.title,
    infoHash: t.infoHash,
  }));

  return feed;
};
