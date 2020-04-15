const { writeFileSync } = require('fs');
const Path = require('path');
const Magnet2torrent = require('..');

// ubuntu-16.04.1-server-amd64.iso
const magnet = 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458';

const m2t = new Magnet2torrent();

// Get a parsed torrent
m2t.getTorrent(magnet).then(torrent => {
	console.log(torrent.infoHash);
	writeFileSync(Path.resolve(__dirname, `${torrent.name}.torrent`), torrent.toTorrentFile());
});

// Get only buffer of torrent
// m2t.getTorrentBuffer(magnet).then(buffer => {
// 	writeFileSync(Path.resolve(__dirname, 'test.torrent'), buffer);
// });
