/* Utils */

const path = require('path')
const HOME_PATH = process.env.HOME || process.env.HOMEPATH

exports.DOWNLOAD_DIR = path.join(HOME_PATH, '/mediazone')
// exports.DOWNLOAD_DIR = '/var/lib/transmission-daemon/downloads/'
