/* Utils */

import path from "path";

const HOME_PATH = process.env.HOME || process.env.HOMEPATH;

export const DOWNLOAD_DIR = HOME_PATH && path.join(HOME_PATH, "/mz-downloads");
