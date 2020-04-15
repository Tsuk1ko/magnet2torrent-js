# magnet2torrent

This module uses [torrent-stream](https://www.npmjs.com/package/torrent-stream) to download metadata of magnet links only, without creating any temp file.

## Install

```bash
npm i magnet2torrent-js
```

## API

### `constructor Magnet2torrent(options?: object): Magnet2torrent`

Optional options are:

```javascript
{
    trackers: [],                  // {Array<string>} Trackers to use, default is []
    addTrackersToTorrent: false,   // {boolean} Default is false
    timeout: 0                     // {number} Timeout seconds, set to 0 will disable it, default is 0
}
```

### `Magnet2torrent.getTorrent(magnet: string): Promise<Torrent>`

`magnet` can be a full BTIH magnet link or its hash only.

Both **sha-1 hash** and **base32 encoded hash** are supported.

This method will return an instance of [parse-torrent](https://www.npmjs.com/package/parse-torrent), with 2 extra functions:

- `toTorrentFile()` - alias of `ParseTorrent.toTorrentFile(torrent)`
- `toMagnetURI()` - alias of `ParseTorrent.toMagnetURI(torrent)`

### `Magnet2torrent.getTorrentBuffer(magnet: string): Promise<Buffer>`

This method will return a buffer of torrent.

It is equal to `getTorrent(magnet).then(torrent => torrent.toTorrentFile())`.

## Example

### Download torrent file simply

```javascript
const { writeFileSync } = require('fs');
const Magnet2torrent = require('magnet2torrent-js');

// ubuntu-16.04.1-server-amd64.iso
const magnet = 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458';

const m2t = new Magnet2torrent({ timeout: 60 });

m2t.getTorrent(magnet).then(torrent => {
    console.log(torrent.infoHash);
    writeFileSync(`${torrent.name}.torrent`, torrent.toTorrentFile());
}).catch(e => {
    // Timeout or error occured
    console.error(e);
});
```

### Use custom trackers and write them to torrent file

```javascript
const { writeFileSync } = require('fs');
const Magnet2torrent = require('magnet2torrent-js');

// https://github.com/ngosang/trackerslist
const trackers = [
    'udp://tracker.coppersurfer.tk:6969/announce',
    'udp://tracker.open-internet.nl:6969/announce',
    'udp://tracker.leechers-paradise.org:6969/announce',
    // ...
];

// ubuntu-16.04.1-server-amd64.iso
const magnet = 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458';

const m2t = new Magnet2torrent({
    trackers,
    addTrackersToTorrent: true
});

m2t.getTorrent(magnet).then(torrent => {
    console.log('These trackers have been added:', torrent.announce);
    writeFileSync(`${torrent.name}.torrent`, torrent.toTorrentFile());
}).catch(e => {
    // Timeout or error occured
    console.error(e);
});
```
