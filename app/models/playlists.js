var mongoose = require('mongoose')
var Schema = mongoose.Schema

var tagSchema = Schema({
  tag: String
})

var songSchema = Schema({
  s_index: Number,
  s_id: String,
  s_title: String
})

var playlistSchema = Schema({
  img: String,
  name: String,
  playlist_author: String,
  tags: [tagSchema],
  songs: [songSchema],
  play_count: Number,
  favorites: Number
})

var Playlist = mongoose.model('Playlist', playlistSchema)
