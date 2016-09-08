// load express and create the app
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var multer      = require('multer');
var cloudinary = require('cloudinary')
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
// var Playlist     = require('./app/models/playlists');
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
var path        = require('path');
var bcrypt = require('bcrypt');

cloudinary.config({
  cloud_name: 'tokkitv',
  api_key: '271341468239996',
  api_secret: 'usmiuBpU33Lcvavf8quADMhicSo'
});


// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// set static files location
app.use(express.static(__dirname + '/public'));

app.all('/', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.join(__dirname + '/public/tokkitv.html'));
});


// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      profilepic: '/images/placeholder-pic.jpg',
      location: req.body.location,
      about: req.body.about,
      email: req.body.email,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({success: false, user: 'false', msg: 'Authentication failed user does not exist'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, user: 'true', msg: 'Something you entered was not quite right. Try again!'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      username: decoded.username
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json(user);
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

apiRoutes.patch('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      username: decoded.username
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          var userinfo = {};
          var username = req.body.username

          var favoriteTagArray = user.favoriteTag;
          favoriteTagArray.push({tag: req.body.favoriteTag });

          var favoritePlaylistArray = user.favoritePlaylists;
          favoritePlaylistArray.push({playlist_id: req.body.favoritePlaylists, user_id: req.body.username });

          var historyArray = user.history;
          historyArray.push({playlist_id: req.body.historyPlaylist_id});

          if (req.body.firstname) userinfo.firstname = req.body.firstname;
          if (req.body.lastname) userinfo.lastname = req.body.lastname;
          if (req.body.profilepic) userinfo.profilepic = req.body.profilepic;
          if (req.body.location) userinfo.location = req.body.location;
          if (req.body.about) userinfo.about = req.body.about;
          if (req.body.email) userinfo.email = req.body.email;
          if (req.body.password) bcrypt.genSalt(10, function(err, salt) {
              if (err) {
                  return next(err);
              }
              bcrypt.hash(req.body.password, salt, function(err, hash) {
                  if (err) {
                      return next(err);
                  }
                  userinfo.password = hash;
              });
          });
          if (req.body.favoriteTag) userinfo.favoriteTag = favoriteTagArray;
          if (req.body.favoritePlaylists) userinfo.favoritePlaylists = favoritePlaylistArray;
          if (req.body.historyPlaylist_id) userinfo.history = historyArray;

          User.update({username: username}, userinfo, function(err, numberAffected, rawResponse) {
             return res.json({success: true, msg: 'user updated successfully'});
          });

        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});


// If you don't define the playlist schema in line, it throws a gigantic fit, don't know why, don't even ask me tbh

var Schema = mongoose.Schema

var tagSchema = Schema({
  tag: String
})

var songSchema = Schema({
  id: String,
  title: String
})

var playlistSchema = Schema({
  img: String,
  name: String,
  playlist_author: String,
  tags: [tagSchema],
  songs: [songSchema],
  play_count: { type: Number, default: 0 },
  favorites: Number
})

var Playlist = mongoose.model('Playlist', playlistSchema)


apiRoutes.post('/playlist', function(req, res) {
       var playlist = new Playlist({
          img: req.body.img,
          name: req.body.name,
          playlist_author: req.body.playlist_author,
          tags: req.body.tags,
          songs: req.body.songs,
          play_count: req.body.play_count,
          favorites: req.body.favorites,
        });

        playlist.save(function(err) {
          if (err) {
            return res.json({success: false, msg: 'Failed'});
          }
          return res.json({success: true, playlist_id: playlist._id});
        });
    });


apiRoutes.get('/playlist', function(req, res) {
        Playlist.find(function(err, playlist) {
            if (err)
                res.send(err);

            res.json(playlist);
        });
    });


apiRoutes.get('/playlist/:playlist_id', function(req, res) {
        Playlist.findById(req.params.playlist_id, function(err, playlist) {
            if (err)
                return res.send(err);
                return res.json(playlist);
            });
        });

apiRoutes.patch('/playlist/:playlist_id', function(req, res) {
  Playlist.findByIdAndUpdate(req.params.playlist_id, {$inc: { play_count: 1} }, function(err, playlist) {
      if (err)
          return res.send(err);
          return res.json(playlist);
      });
  });

        apiRoutes.put('/playlist/:playlist_id', function(req, res) {
                 Playlist.findById(req.params.playlist_id, function(err, playlist) {

                     if (err)
                         res.send(err);

                         playlist.img = req.body.img;
                         playlist.name = req.body.name;
                         playlist.playlist_author = req.body.playlist_author;
                         playlist.tags = req.body.tags;
                         playlist.songs = req.body.songs;
                         playlist.play_count = req.body.play_count;
                         playlist.favorites = req.body.favorites;

                     playlist.save(function(err) {
                         if (err)
                             res.send(playlist);

                         res.json({ message: 'Playlist updated!' });
                     });

                 });
                });

                apiRoutes.delete('/playlist/:playlist_id', function(req, res) {
                  Playlist.remove({
                      _id: req.params.playlist_id
                  }, function(err, playlist) {
                      if (err)
                          res.send(err);

                      res.json({ message: 'Successfully deleted' });
                  });
                        });

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


var upload = multer({ dest: 'upload/'});
var fs = require('fs');
var type = upload.single('file');

app.post('/upload', upload.single('file'), function (req,res,next) {
  if(req.file) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      if (result.url) {
        res.json({ success: true, imgurl: result.url });
      } else {
        res.json(error);
      }
    });
  } else {
    next();
  }
});


// connect the api routes under /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('Wow, fantastic baby: http://localhost:' + port);
