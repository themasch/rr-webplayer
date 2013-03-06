var express = require('express')
  , app     = express()
  , fs      = require('fs')
  , http    = require('http')
  , ffmpeg  = require('fluent-ffmpeg')

// serve station list
app.get('/stations.json', function(req, res) {
  fs.createReadStream('./public/stations.json').pipe(res)
})
// serve index side
app.get('/', function(req, res) {
  fs.createReadStream('./public/index.html').pipe(res)
})
// ogg all teh steams!
app.get('/stream/:name.ogg', function(req, res) {
  res.contentType('ogg')
  http.get('http://pub3.rockradio.com:80/rr_' + req.params.name, function(inc) {
    var proc = new ffmpeg({
        source: inc,
        timeout: 10*60*60,
        nolog: true
      })
      .toFormat('ogg')
      .withAudioBitrate('96k')
      .withAudioChannels(2)
      .withAudioCodec('libvorbis')
      .writeToStream(res)
  });
})
// profit!
app.listen(9090)
