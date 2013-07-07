
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
 * Parse a Tracks object
 * 
 * @param {Object} tracks the object returned from a RadioRequest
 */

Station.prototype._parseTracks = function(tracks, fn) {
  var self = this;

  if (!this._tracks) {
    this._tracks = [];
  }

  if (Array.isArray(tracks.gids)) {
    tracks.gids.forEach(function(uri) {
      var track = new Track();
      track._spotify = self._spotify;
      track.gid = util.uri2gid('spotify:track:' + uri);
      self._tracks.push(track);
    });
  }

  if (!this.feedback) {
    this.feedback = {};
  }

  if (Array.isArray(tracks.feedback)) {
    tracks.feedback.forEach(function(feedback) {
      self.feedback['spotify:track:' + feedback.uri] = feedback.type;
    });
  }
}

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
  if ('number' == typeof lastTracks) {
    length = lastTracks;
    lastTracks = null;
  } 
  if ('function' == typeof length) {
    fn = length;
    length = null;
  } else if ('function' == typeof lastTracks) {
    fn = lastTracks;
    lastTracks = length = null;
  }
  if (null == length) length = 50;
  if (lastTracks && !Array.isArray(lastTracks)) {
    lastTracks = [ lastTracks ];
  }

  debug('getTracks(%j, %d)', lastTracks, length);

  var self = this;
  if (this._tracks.length < length) {
    this._spotify.getTracksForStation(this.seeds, lastTracks, this.id, (length - this._tracks.length), function(err, tracks) {
      if (err) return fn(err);

      self._parseTracks(tracks);
      return fn(null, self._tracks.splice(0, length));
    });
  } else {
    return fn(null, self._tracks.splice(0, length));
  }
};
