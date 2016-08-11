var mongoose = require('mongoose')
var Schema = mongoose.Schema

var playlistSchema = Schema({
  _id     : Number,
  img    : String,
  name     : String,
  playlist_author: String,
  tags : [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  songs : [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  play_count: Number,
  favorites: Number,
});

var tagSchema = Schema({
  _playlist : { type: Number, ref: 'Playlist' }
  tag    : String
});

var songSchema = Schema({
  _playlist : { type: Number, ref: 'Playlist' }
  s_index : Number,
  s_id : String,
  s_title : String
});

var Playlist  = mongoose.model('Playlist', playlistSchema);
var Tag  = mongoose.model('Tag', tagSchema);
var Song  = mongoose.model('Song', songSchema);
