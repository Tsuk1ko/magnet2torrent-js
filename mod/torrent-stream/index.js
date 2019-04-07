var hat = require('hat');
var pws = require('peer-wire-swarm');
var bncode = require('bncode');
var parseTorrent = require('parse-torrent');
var events = require('events');
var peerDiscovery = require('torrent-discovery');
var bufferFrom = require('buffer-from');
var exchangeMetadata = require('./lib/exchange-metadata');

var DEFAULT_PORT = 6881;

var torrentStream = function (link, opts) {
	link = parseTorrent(link);
	var infoHash = link.infoHash;

	if (!opts) opts = {};
	if (!opts.id) opts.id = '-TS0008-' + hat(48);
	if (!opts.name) opts.name = 'torrent-stream';

	var engine = new events.EventEmitter();
	var swarm = pws(infoHash, opts.id, {
		size: opts.connections || 100,
		speed: 10
	});

	engine.infoHash = infoHash;
	engine.amInterested = false;
	engine.swarm = swarm;

	var discovery = peerDiscovery({
		peerId: bufferFrom(opts.id),
		dht: (opts.dht !== undefined) ? opts.dht : true,
		tracker: (opts.tracker !== undefined) ? opts.tracker : true,
		port: DEFAULT_PORT,
		announce: opts.trackers
	});

	discovery.on('peer', function (addr) {
		engine.connect(addr);
	});

	var ontorrent = function (torrent) {
		engine.emit('torrent', torrent);
	};

	var exchange = exchangeMetadata(engine, function (metadata) {
		var buf = bncode.encode({
			info: bncode.decode(metadata)
		});

		ontorrent(parseTorrent(buf));
	});

	swarm.on('wire', function (wire) {
		exchange(wire);
	});

	discovery.setTorrent(link);

	engine.connect = function (addr) {
		swarm.add(addr);
	};

	engine.disconnect = function (addr) {
		swarm.remove(addr);
	};

	engine.destroy = function () {
		swarm.destroy();
		discovery.stop();
	};

	return engine;
};

module.exports = torrentStream;
