const Fs = require('fs');
const Path = require('path');
const Magnet2torrent = require('..');

// https://github.com/ngosang/trackerslist
const trackers = [
	'udp://tracker.coppersurfer.tk:6969/announce',
	'udp://tracker.open-internet.nl:6969/announce',
	'udp://tracker.leechers-paradise.org:6969/announce',
	'udp://tracker.internetwarriors.net:1337/announce',
	'udp://tracker.opentrackr.org:1337/announce',
	'udp://9.rarbg.to:2710/announce',
	'udp://9.rarbg.me:2710/announce',
	'http://tracker3.itzmx.com:6961/announce',
	'http://tracker1.itzmx.com:8080/announce',
	'udp://exodus.desync.com:6969/announce',
	'udp://explodie.org:6969/announce',
	'udp://denis.stalker.upeer.me:6969/announce',
	'udp://tracker.torrent.eu.org:451/announce',
	'udp://tracker.tiny-vps.com:6969/announce',
	'udp://thetracker.org:80/announce',
	'udp://open.demonii.si:1337/announce',
	'udp://ipv4.tracker.harry.lu:80/announce',
	'http://vps02.net.orel.ru:80/announce',
	'udp://retracker.netbynet.ru:2710/announce',
	'udp://bt.xxx-tracker.com:2710/announce',
];

// ubuntu-16.04.1-server-amd64.iso
const magnet = 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458';

const m2t = new Magnet2torrent({
	trackers,
	addTrackersToTorrent: true,
});

m2t.getTorrentBuffer(magnet).then(buffer => {
	Fs.writeFileSync(Path.resolve(__dirname, 'test.torrent'), buffer);
});
