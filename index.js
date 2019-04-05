const TorrentStream = require('torrent-stream');
const ParseTorrent = require('parse-torrent');
const mem = require('memory-chunk-store');

/**
 * Convert magnet to torrent buffer
 *
 * @class Magnet2torrent
 */
class Magnet2torrent {
	/**
	 * Creates an instance of Magnet2torrent.
	 * @param {Array<string>} [trackers=[]] Custom tracker list
	 * @memberof Magnet2torrent
	 */
	constructor(trackers = []) {
		if (!Array.isArray(trackers))
			throw new TypeError('announceList must be an array');
		for (let tracker of trackers) {
			if (typeof tracker != 'string')
				throw new TypeError('member of announceList must be string');
		}
		this.trackers = trackers;
	}

	/**
	 * Convert magnet to torrent buffer
	 *
	 * @param {string} magnet Magnet link
	 * @returns
	 * @memberof Magnet2torrent
	 */
	getTorrentBuffer(magnet) {
		return new Promise(resolve => {
			const engine = TorrentStream(magnet, {
				trackers: this.trackers,
				storage: mem
			});

			engine.on('torrent', () => {
				let {
					torrent
				} = engine;
				if (this.trackers.length > 0) {
					torrent.announce = [];
					torrent.announceList = [
						[].concat(this.trackers)
					];
				}
				resolve(ParseTorrent.toTorrentFile(torrent));
				engine.destroy();
			});
		});
	}
}

module.exports = Magnet2torrent;
