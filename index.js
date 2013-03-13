var express = require('express')
  , app     = express()
  , fs      = require('fs')
  , http    = require('http')
  , ffmpeg  = require('fluent-ffmpeg')
  , shoutc  = require('./ShoutcastMetadataStream')

// serve station list
app.get('/stations.json', function(req, res) {
  fs.createReadStream('./public/stations.json').pipe(res)
})
// serve index side
app.get('/', function(req, res) {
  fs.createReadStream('./public/index.html').pipe(res)
})

var streamTitle = {

}
app.get('/data/:name.json', function(q, s) {
  console.log('data for ', q.params.name);
  s.json(streamTitle[q.params.name] || 'no information');
  console.log('answers here!');
})

// ogg all teh steams!
app.get('/stream/:name.ogg', function(req, res) {
  res.contentType('ogg')
  http.get({
    'host': 'pub3.rockradio.com',
    'path': '/rr_' + req.params.name,
    'headers': {
      'icy-metadata': 1
    }
  },
  function(inc) {
    var metaparser = new shoutc({ metaint: parseInt(inc.headers['icy-metaint'], 10) });
    inc.pipe(metaparser)
    var channel = req.params.name;
    metaparser.on('metadata', function(data) {
      streamTitle[channel] = {}
      data.split(/;/).forEach(function(line) {
        var x = line.split(/=/);
        if(x.length != 2)
          return;
        streamTitle[channel][x[0]] = x[1].replace(/^'|'$/g, '');
      });
    });
    var proc = new ffmpeg({
        source: metaparser,
        timeout: 10*60*60,
        nolog: true
      })
      .toFormat('ogg')
      .withAudioBitrate('96k')
      .withAudioChannels(2)
      .withAudioCodec('libvorbis')
      .writeToStream(res, function() {
        inc.destroy()
      })

  });
})
// profit!
app.listen(9090)
