const parseTorrent = require('parse-torrent');

module.exports = magnet => {
	const torrent = parseTorrent(magnet);
	torrent.toMagnetURI = () => parseTorrent.toMagnetURI(torrent);
	torrent.toTorrentFile = () => parseTorrent.toTorrentFile(torrent);
	return torrent;
};
