const parseTorrent = require('./torrent');
const hat = require('hat');
const pws = require('peer-wire-swarm');
const bncode = require('bncode');
const events = require('events');
const PeerDiscovery = require('torrent-discovery');
const bufferFrom = require('buffer-from');
const exchangeMetadata = require('./lib/exchange-metadata');

const DEFAULT_PORT = 6881;

module.exports = (link, opts) => {
	link = parseTorrent(link);
	const infoHash = link.infoHash;

	if (!opts) opts = {};
	if (!opts.id) opts.id = '-TS0008-' + hat(48);
	if (!opts.name) opts.name = 'torrent-stream';

	const engine = new events.EventEmitter();
	const swarm = pws(infoHash, opts.id, {
		size: opts.connections || 100,
		speed: 10,
	});

	engine.infoHash = infoHash;
	engine.amInterested = false;
	engine.swarm = swarm;

	const discovery = new PeerDiscovery({
		peerId: bufferFrom(opts.id),
		infoHash,
		dht: opts.dht !== undefined ? opts.dht : true,
		tracker: opts.tracker !== undefined ? opts.tracker : true,
		port: DEFAULT_PORT,
		announce: opts.trackers,
	});

	discovery.on('peer', addr => {
		engine.connect(addr);
	});

	const ontorrent = torrent => {
		engine.emit('torrent', torrent);
	};

	const exchange = exchangeMetadata(engine, metadata => {
		const buf = bncode.encode({
			info: bncode.decode(metadata),
		});
		ontorrent(parseTorrent(buf));
	});

	swarm.on('wire', wire => {
		exchange(wire);
	});

	engine.connect = addr => {
		swarm.add(addr);
	};

	engine.disconnect = addr => {
		swarm.remove(addr);
	};

	engine.destroy = () => {
		swarm.destroy();
		discovery.destroy();
	};

	return engine;
};
