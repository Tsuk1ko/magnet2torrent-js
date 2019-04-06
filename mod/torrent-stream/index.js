var hat = require('hat')
var pws = require('peer-wire-swarm')
var bncode = require('bncode')
var parseTorrent = require('parse-torrent')
var events = require('events')
var peerDiscovery = require('torrent-discovery')
var bufferFrom = require('buffer-from')

var blocklist = require('ip-set')
var exchangeMetadata = require('./lib/exchange-metadata')

var DEFAULT_PORT = 6881

var torrentStream = function (link, opts) {
	link = parseTorrent(link)
	var metadata = link.infoBuffer || null
	var infoHash = link.infoHash

	if (!opts) opts = {}
	if (!opts.id) opts.id = '-TS0008-' + hat(48)
	if (!opts.name) opts.name = 'torrent-stream'
	if (!opts.flood) opts.flood = 0 // Pulse defaults:
	if (!opts.pulse) opts.pulse = Number.MAX_SAFE_INTEGER // Do not pulse

	var engine = new events.EventEmitter()
	var swarm = pws(infoHash, opts.id, {
		size: (opts.connections || opts.size),
		speed: 10
	})

	engine.infoHash = infoHash
	engine.metadata = metadata
	engine.files = []
	engine.selection = []
	engine.torrent = null
	engine.bitfield = null
	engine.amInterested = false
	engine.store = null
	engine.swarm = swarm
	engine._flood = opts.flood
	engine._pulse = opts.pulse

	var discovery = peerDiscovery({
		peerId: bufferFrom(opts.id),
		dht: (opts.dht !== undefined) ? opts.dht : true,
		tracker: (opts.tracker !== undefined) ? opts.tracker : true,
		port: DEFAULT_PORT,
		announce: opts.trackers
	})
	var blocked = blocklist(opts.blocklist)

	discovery.on('peer', function (addr) {
		if (blocked.contains(addr.split(':')[0])) {
			engine.emit('blocked-peer', addr)
		} else {
			engine.emit('peer', addr)
			engine.connect(addr)
		}
	})

	var ontorrent = function (torrent) {
		engine.torrent = torrent
		engine.emit('torrent', torrent)
	}

	var exchange = exchangeMetadata(engine, function (metadata) {
		var buf = bncode.encode({
			info: bncode.decode(metadata),
			'announce-list': []
		})

		ontorrent(parseTorrent(buf))
	})

	swarm.on('wire', function (wire) {
		engine.emit('wire', wire)
		exchange(wire)
		if (engine.bitfield) wire.bitfield(engine.bitfield)
	})

	swarm.pause()

	if (link.files && engine.metadata) {
		swarm.resume()
		ontorrent(link)
	} else {
		swarm.resume()
		discovery.setTorrent(link)
	}

	engine.setPulse = function (bps) {
		// Set minimum byte/second pulse starting now (dynamic)
		// Eg. Start pulsing at minimum 312 KBps:
		// engine.setPulse(312*1024)

		engine._pulse = bps
	}

	engine.setFlood = function (b) {
		// Set bytes to flood starting now (dynamic)
		// Eg. Start flooding for next 10 MB:
		// engine.setFlood(10*1024*1024)

		engine._flood = b + swarm.downloaded
	}

	engine.setFloodedPulse = function (b, bps) {
		// Set bytes to flood before starting a minimum byte/second pulse (dynamic)
		// Eg. Start flooding for next 10 MB, then start pulsing at minimum 312 KBps:
		// engine.setFloodedPulse(10*1024*1024, 312*1024)

		engine.setFlood(b)
		engine.setPulse(bps)
	}

	engine.flood = function () {
		// Reset flood/pulse values to default (dynamic)
		// Eg. Flood the network starting now:
		// engine.flood()

		engine._flood = 0
		engine._pulse = Number.MAX_SAFE_INTEGER
	}

	engine.connect = function (addr) {
		swarm.add(addr)
	}

	engine.disconnect = function (addr) {
		swarm.remove(addr)
	}

	engine.block = function (addr) {
		blocked.add(addr.split(':')[0])
		engine.disconnect(addr)
		engine.emit('blocking', addr)
	}

	engine.destroy = function () {
		swarm.destroy()
		discovery.stop()
	}

	var findPort = function (def, cb) {
		var net = require('net')
		var s = net.createServer()

		s.on('error', function () {
			findPort(0, cb)
		})

		s.listen(def, function () {
			var port = s.address().port
			s.close(function () {
				engine.listen(port, cb)
			})
		})
	}

	engine.listen = function (port, cb) {
		if (typeof port === 'function') return engine.listen(0, port)
		if (!port) return findPort(opts.port || DEFAULT_PORT, cb)
		engine.port = port
		swarm.listen(engine.port, cb)
		discovery.updatePort(engine.port)
	}

	return engine
}

module.exports = torrentStream
