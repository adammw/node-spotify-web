
/**
 * Gets a `Radio` instance based off of the given Spotify radio URI.
 */

var Spotify = require('../');
var login = require('../login');
var lame = require('lame');
var Speaker = require('speaker');

// determine the seed URI to use, can be either track, artist, album, genre or playlist
var uri = process.argv[2] || 'spotify:artist:5eAWCfyUhZtHHtBdNk56l1';

// initiate the Spotify session
Spotify.login(login.username, login.password, function (err, spotify) {
  if (err) throw err;

  spotify.createStation(uri, {
    title: 'Test Radio Station',
    titleUri: uri,
    imageUri: '',
    subtitle: '',
    subtitleUri: ''
  }, function(err, station) {
    if (err) throw err;

    console.log('Station:', station);
    station.getTracks(function(err, tracks) {
      console.log('Will play %d tracks from station "%s"', tracks.length, station.title);

      var playNextTrack = function() {
        var track = tracks.shift();
        if (!track) {
          spotify.disconnect();
        } else {
          track.get(function(err, track) {
            if (err) throw err;
            console.log('Playing: %s - %s', track.artist[0].name, track.name);

            track.play()
              .pipe(new lame.Decoder())
              .pipe(new Speaker())
              .on('finish', function () {
                playNextTrack();
              });
          });
        }
      };

      playNextTrack();
    });
  });
});
