/// <reference types="node" />

import * as ParseTorrent from 'parse-torrent';

interface Torrent extends ParseTorrent.Instance {
	/**
	 * @returns {string} Magnet URI
	 * @memberof Torrent
	 */
	toMagnetURI(): string;
	/**
	 * @returns {Buffer} Torrent buffer
	 * @memberof Torrent
	 */
	toTorrentFile(): Buffer;
}

declare class Magnet2torrent {
	/** Magnet to torrent client */
	constructor(options?: {
		/** Trackers list, default is [] */
		trackers?: Array<string>;
		/** Whether to add the tracker list into the torrent file, default is false */
		addTrackersToTorrent?: boolean;
		/** Timeout seconds, set to 0 will disable it, default is 0 */
		timeout?: number;
	});

	/** Trackers list */
	trackers: Array<string>;

	/**
	 * Convert magnet to torrent
	 *
	 * @param {string} magnet Magnet link
	 * @returns {Promise<Torrent>} Torrent
	 * @memberof Magnet2torrent
	 */
	getTorrent(magnet: string): Promise<Torrent>;

	/**
	 * Convert magnet to torrent buffer
	 *
	 * @param {string} magnet Magnet link
	 * @returns {Promise<Buffer>} Buffer of torrent
	 * @memberof Magnet2torrent
	 */
	getTorrentBuffer(magnet: string): Promise<Buffer>;
}

export = Magnet2torrent;
