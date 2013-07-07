
/**
 * Module dependencies.
 */

var util = require('./util');
var Track = require('./track')
var Station = require('./schemas').radio['spotify.radio.proto.Station'];
var debug = require('debug')('spotify-web:station');

/**
 * Module exports.
 */

exports = module.exports = Station;

/**
 * Returns tracks
 *
 * @param {String|Array} lastTracks (optional)
 * @param {Number} length (optional) number of tracks requested
 * @param {Function} fn callback function
 * @api public
 */

Station.prototype.getTracks = function(lastTracks, length, fn) {
  // argument surgery
  if ('function' == typeof lastTracks) {
    fn = lastTracks;
    lastTracks = length = null;
  } else if ('function' == typeof length) {
    fn = length;
    length = null;
  }
  if (null == length) length = 50;
  if (lastTracks && !Array.isArray(lastTracks)) {
    lastTracks = [ lastTracks ];
  }

  debug('getTracks(%j, %d)', lastTracks, length);

  var self = this;
  console.log('_spotify:', this._spotify);
  console.log('tracks:', this._tracks);
  console.log(this);
  var parseTracks = function(length) {
    console.log(self);

    var tracks = [];
    for (var i = 0; i < length; i++) {
      var track = new Track();
      track._spotify = self._spotify;
      track.gid = util.uri2gid('spotify:track:' + self._tracks[i]);

      tracks.push(track);
    }
    return fn(null, tracks);
  }

  if (this._tracks.length < length) {
    this._spotify.getTracksForStation(this.seeds, lastTracks, this.id, (length - this._tracks.length), function(err, tracks) {
      if (err) return fn(err);

      tracks.gids.forEach(function(gid) {
        self._tracks.push(gid);
      });
      tracks.feedback.forEach(function(feedback) {
        self.feedback['spotify:track:' + feedback.uri] = feedback.type;
      });

      parseTracks(length);
    });
  } else {
    parseTracks(length);
  }
};
