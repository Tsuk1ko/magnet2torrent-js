# magnet2torrent

This module uses [torrent-stream](https://www.npmjs.com/package/torrent-stream) to download metadata of magnet links only, without creating any temp file.

## Install

```bash
npm i magnet2torrent-js
```

## Example

### Download torrent file simply

```javascript
const Fs = require('fs');
const Magnet2torrent = require('magnet2torrent-js');

// ubuntu-16.04.1-server-amd64.iso
const magnet = 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458';

let m2t = new Magnet2torrent();

m2t.getTorrentBuffer(magnet).then(buffer => {
    let wstream = Fs.createWriteStream('test.torrent');
    wstream.write(buffer);
    wstream.end();
});
```

### Use custom trackers and write them to torrent file

```javascript
const Fs = require('fs');
const Magnet2torrent = require('magnet2torrent-js');

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
    'udp://bt.xxx-tracker.com:2710/announce'
];

// ubuntu-16.04.1-server-amd64.iso
const magnet = 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458';

let m2t = new Magnet2torrent(trackers, true);

m2t.getTorrentBuffer(magnet).then(buffer => {
    let wstream = Fs.createWriteStream('test.torrent');
    wstream.write(buffer);
    wstream.end();
});
```
