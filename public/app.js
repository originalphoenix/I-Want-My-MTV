var app = angular.module('JukeTubeApp', ['ngRoute', 'xeditable', 'ui.filters', 'ngFileUpload']);
// Run
app.run(function() {
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
// Config
app.config(function($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

app.config(function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        rewriteLinks: false
    });
});

app.run(function ($rootScope, $location, $window, userInfoService) {
 $rootScope.$on("$locationChangeStart", function (event, next, current) {
       $('#preloader').show();
       $('.modal-backdrop').remove();
      var userAuthenticated = $window.localStorage['jwtToken'];; /* Check if the user is logged in */
      if (!userAuthenticated && next.isLogin) {
          $rootScope.savedLocation = $location.url();
          $location.path('/signin');
      }
 });
 $rootScope.$on('$viewContentLoaded', function(){
     $('#preloader').fadeOut( "slow" );
     var elements = document.getElementsByClassName('txt-rotate');
     for (var i=0; i<elements.length; i++) {
       var toRotate = elements[i].getAttribute('data-rotate');
       var period = elements[i].getAttribute('data-period');
       if (toRotate) {
         new TxtRotate(elements[i], JSON.parse(toRotate), period);
       }
     }
     // INJECT CSS
     var css = document.createElement("style");
     css.type = "text/css";
     css.innerHTML = ".txt-rotate > .wrap { border-right: 0.1em solid #fff }";
     document.body.appendChild(css);
});
 $rootScope.hideit = false;
 $rootScope.loggedIn = $window.localStorage['jwtToken'];
 userInfoService.getUserInfo();
 $rootScope.logout = function() {
     console.log('who the fuck is scraeming log off at my house. show yourself, coward. I will never log off')
     $window.localStorage.removeItem('jwtToken');
     userInfoService.getUserInfo();
     $window.location.reload(); //This is not the angular way, but it's my way, think of a better way soon
 }
 $rootScope.searchModel = "";

 });

// Routes
app.config(function($routeProvider) {
    $routeProvider
    // route for the home page
        .when('/', {
            templateUrl: 'theme/pages/home.html',
            controller: 'mainController',
            isLogin: false
        }).when('/about', {
            templateUrl: 'theme/pages/about.html',
            controller: 'mainController',
            isLogin: false
        }).when('/signup', {
            templateUrl: 'signup.html',
            controller: 'signupController',
            isLogin: false
        }).when('/signin', {
            templateUrl: 'signin.html',
            controller: 'signinController',
            isLogin: false
        })
        // route for the profile page
        .when('/profile', {
            templateUrl: 'theme/pages/profile.html',
            controller: 'profileController',
            isLogin: true
        })
        // route for the genre page
        .when('/create', {
            templateUrl: 'theme/pages/playlist-create.html',
            controller: 'createController',
            isLogin: true
        })
        .when('/new', {
            templateUrl: 'theme/pages/new.html',
            controller: 'whatsNewController',
            isLogin: false
        })
        // route for the genre page
        .when('/play', {
            templateUrl: 'theme/pages/jukebox.html',
            controller: 'VideosController',
            isLogin: false
        })
        // route for the genre page
        .when('/genres', {
            templateUrl: 'theme/pages/genres.html',
            controller: 'genreController',
            isLogin: false
        })
        .otherwise({
            templateUrl: 'theme/pages/404.html',
        });
});


//DIRECTIVES

app.directive('focus', function($timeout, $parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch(attrs.focus, function(newValue, oldValue) {
                if (newValue) {
                    element[0].focus();
                }
            });
            element.bind("blur", function(e) {
                $timeout(function() {
                    scope.$apply(attrs.focus + "=false");
                }, 0);
            });
            element.bind("focus", function(e) {
                $timeout(function() {
                    $('#overlay-search-main').toggleClass('open');
                    scope.$apply(attrs.focus + "=true");
                }, 0);
            })
        }
    }
});

// WE FACTORIES NOW BOI
app.factory('userInfoService', function($http, $window, $rootScope) {
    return {
        getUserInfo: function() {
            $http({
                method: 'GET',
                url: '/api/memberinfo',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': $window.localStorage['jwtToken']
                }
            }).success(function(data) {
                if (data.errors) {
                    $scope.errorName = data.errors;
                } else {
                    $rootScope.username = data.username;
                    $rootScope.firstname = data.firstname;
                    $rootScope.lastname = data.lastname;
                    $rootScope.email = data.email;
                    $rootScope.profilepic = data.profilepic;
                    $rootScope.location = data.location;
                    $rootScope.about = data.about;
                    $rootScope.favoriteTags = data.favoriteTag;
                    $rootScope.favoritePlaylists = data.favoritePlaylists;
                    $rootScope.playlistHistory = data.history;
                }
            });
        }
    };
});
app.factory('playlistInfoService', function($http) {
    return {
        getPlaylists: function() {
            return $http({
                url: '/api/playlist/',
                method: 'GET'
            })
        }
    }
});


// Service
app.service('VideosService', ['$window', '$rootScope', '$log', '$http', '$location',
    function($window, $rootScope, $log, $http, $location) {
        var service = this;
        var youtube = {
            ready: false,
            player: null,
            playerId: null,
            videoId: null,
            videoTitle: null,
            state: 'playing'
        };
        var results = [];
        var upcoming = [];
        var history = [];
        this.onYouTubeIframeAPIReady = function() {
            $log.info('Youtube API is ready');
            youtube.ready = true;
            service.bindPlayer('placeholder');
            service.loadPlayer();
            //  $rootScope.$apply();
        };

        function onYoutubeReady(event) {
          $location.search()
            var playlist_id = $location.search().playlist;
            $http({
                method: 'GET',
                url: '/api/playlist/' + playlist_id
            }).then(function successCallback(response) {
                console.log('everything is going according to keikaku');
                youtube.player.cueVideoById(response.data.songs[0].id);
                youtube.videoId = response.data.songs[0].id;
                youtube.videoTitle = response.data.songs[0].title;
                youtube.player.playVideo();
                service.archiveVideo(upcoming[0].id, upcoming[0]
                    .title);
                service.deleteVideo(upcoming, upcoming[0].id);

            });
            $log.info('YouTube Player is ready');
            $('#preloader').hide();
            youtube.player.playVideo();
            var playButton = document.getElementById("play-button");
            playButton.addEventListener("click", function() {
                youtube.player.playVideo();
            });
            var pauseButton = document.getElementById(
                "pause-button");
            pauseButton.addEventListener("click", function() {
                youtube.player.pauseVideo();
            });
        }

        function onYoutubeStateChange(event) {
            if (event.data == YT.PlayerState.PLAYING) {
                youtube.state = 'playing';
                $("#pause-button").show();
                $("#play-button").hide();
            } else if (event.data == YT.PlayerState.PAUSED) {
                youtube.state = 'paused';
                $("#play-button").show();
                $("#pause-button").hide();
            } else if (event.data == YT.PlayerState.ENDED) {
                youtube.state = 'ended';
                if (typeof upcoming[0] === "undefined") {
                    //TO DO: TRIGGER MODAL THAT LOADS THE NEXT PLAYLIST AFTER A COUNTDOWN TIMER
                    $('#nextPlaylistModal').modal('show')
                } else {
                    service.launchPlayer(upcoming[0].id, upcoming[0]
                        .title);
                    service.archiveVideo(upcoming[0].id, upcoming[0]
                        .title);
                    service.deleteVideo(upcoming, upcoming[0].id);
                }
            }
            $rootScope.$apply();
        }
        this.bindPlayer = function(elementId) {
            $log.info('Binding to ' + elementId);
            youtube.playerId = elementId;
        };
        this.createPlayer = function() {
            $log.info('Creating a new Youtube player for DOM id ' +
                youtube.playerId + ' and video ' + youtube.videoId
            );
            return new YT.Player(youtube.playerId, {
                playerVars: {
                    'rel': 0,
                    'showinfo': 0,
                    'autoplay': 1,
                    'controls': 0,
                    'modestbranding': 1,
                    'iv_load_policy': 3
                },
                events: {
                    'onReady': onYoutubeReady,
                    'onStateChange': onYoutubeStateChange
                }
            });
        };
        this.loadPlayer = function() {
            if (youtube.ready && youtube.playerId) {
                if (youtube.player) {
                    youtube.player.destroy();
                }
                youtube.player = service.createPlayer();
            }
        };
        this.launchPlayer = function(id, title) {
            youtube.player.loadVideoById(id);
            youtube.videoId = id;
            youtube.videoTitle = title;
            return youtube;
        }
        this.listResults = function(data) {
            results.length = 0;
            for (var i = data.items.length - 1; i >= 0; i--) {
                results.push({
                    id: data.items[i].id.videoId,
                    title: data.items[i].snippet.title,
                    description: data.items[i].snippet.description,
                    thumbnail: data.items[i].snippet.thumbnails
                        .default.url,
                    author: data.items[i].snippet.channelTitle
                });
            }
            return results.reverse();
        }
        this.queueVideo = function(id, title) {
            upcoming.push({
                id: id,
                title: title
            });
            return upcoming;
        };
        this.archiveVideo = function(id, title) {
            history.unshift({
                id: id,
                title: title
            });
            return history;
        };
        this.deleteVideo = function(list, id) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i].id === id) {
                    list.splice(i, 1);
                    break;
                }
            }
        };
        this.getYoutube = function() {
            return youtube;
        };
        this.getResults = function() {
            return results;
        };
        this.getUpcoming = function() {
            return upcoming;
        };
        this.getHistory = function() {
            return history;
        };
    }
]);

// create the controller and inject Angular's $scope
app.controller('mainController', function($scope, $rootScope, $http, $window, $location, $route,
    userInfoService, playlistInfoService) {

    $rootScope.$on('$viewContentLoaded', function(){
        $('#preloader').fadeOut( "slow" );
});
    $rootScope.hideit = false;
    $rootScope.loggedIn = $window.localStorage['jwtToken'];
    userInfoService.getUserInfo();
    $scope.customPlaylists = [];
    playlistInfoService.getPlaylists().success(function(data) {
        $scope.customPlaylists = data;
    });

    $scope.favoritePlaylist = function(playlist_id) {
      $scope.user.username = $rootScope.username;
      $scope.user.favoritePlaylists = playlist_id;
        // Posting data to php file
        $http({
            method: 'PATCH',
            url: '/api/memberinfo',
            data: JSON.stringify($scope.user), //forms user object
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $window.localStorage['jwtToken']
            }
        }).success(function(data) {
            if (data.errors) {
                // Showing errors.
                $scope.errorName = data.errors;
            } else {
                $scope.message = data.message;
            }
        });
    };

    $scope.loadPlaylist = function(playlist_id, next) {
        $http({
            method: 'GET',
            url: '/api/playlist/' + playlist_id
        }).then(function successCallback(response) {

            $location.path('play?playlist=' + response.data._id);
        }, function errorCallback(response) {
            console.log('it dead');
        });
    }
    $rootScope.logout = function() {
        console.log('who the fuck is scraeming log off at my house. show yourself, coward. I will never log off')
        $window.localStorage.removeItem('jwtToken');
        userInfoService.getUserInfo();
        $window.location.reload(); //This is not the angular way, but it's my way, think of a better way soon
    }
    $rootScope.searchModel = "";
    $scope.overlayClose = function() {
      $('#overlay-search-main').removeClass('open');
    }
    $scope.user = {};
    $scope.user.favoriteTag = [];
    // calling our submit function.
    $scope.submitTags = function() {
      $scope.user.username = $rootScope.username;
        // Posting data to php file
        $http({
            method: 'PATCH',
            url: '/api/memberinfo',
            data: JSON.stringify($scope.user), //forms user object
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $window.localStorage['jwtToken']
            }
        }).success(function(data) {
            if (data.errors) {
                // Showing errors.
                $scope.errorName = data.errors;
            } else {
              $('#favoriteTagsModal').modal('hide');
                $scope.message = data.message;
            }
        });
    };

});
app.controller('profileController', function($scope, $rootScope, $location, $http, $window,
    userInfoService, playlistInfoService, Upload) {

    $scope.loadPlaylist = function(playlist_id, next) {
        $http({
            method: 'GET',
            url: '/api/playlist/' + playlist_id
        }).then(function successCallback(response) {
            $rootScope.playlistID = response.data._id;
            $location.path('play');
        }, function errorCallback(response) {
            console.log('it dead');
        });
    }
    $rootScope.searchModel = "";
    $scope.profilePicMessage = "Upload a new profile pic"
    $scope.overlayClose = function() {
      $('#overlay-search-main').removeClass('open');
    }
    $scope.customPlaylists = [];
    playlistInfoService.getPlaylists().success(function(data) {
        $scope.customPlaylists = data;
    });
    $scope.Favorites = []
    angular.forEach($rootScope.favoritePlaylists, function(playlist_id) {
          $scope.Favorites.push(playlist_id.playlist_id);
      });
    console.log($scope.Favorites);
    $scope.upload = function(file) {
        Upload.upload({
            url: '/upload',
            arrayKey: '', // default is '[i]'
            data: {
                file: file,
            }
        }).then(function(resp) {
            $('#photoDropZone').addClass('success');
            $('#photoDropZone').removeClass('loading');
            $scope.user.profilepic = resp.data.imgurl;
            $scope.profilePicMessage = 'Success the cloud is pleased with your offering of:' + resp.config.data.file.name; + "Submit this form to update your profile."
          //  form.$setDirty();
        }, function(resp) {
          $('#photoDropZone').addClass('error');
            $scope.profilePicMessage = 'You have angered the cloud: ' + resp.status;
        }, function(evt) {
          $('#photoDropZone').addClass('loading');
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.profilePicMessage = 'Pushing it up into the cloud...'
        });
    };

    $scope.error = false;
    $scope.success = false;
    // create a blank object to handle form data.
    $scope.user = {};
    $scope.user.username = $rootScope.username;
    // calling our submit function.
    $scope.submitForm = function() {
        // Posting data to php file
        $http({
            method: 'PATCH',
            url: '/api/memberinfo',
            data: JSON.stringify($scope.user), //forms user object
            headers: {
                'Content-Type': 'application/json',
                'Authorization': $window.localStorage['jwtToken']
            }
        }).success(function(data) {
            if (data.errors) {
                // Showing errors.
                $scope.error = true;
                $scope.success = false;
                $scope.message = data.errors;
            } else {
                $scope.success = true;
                $scope.error = false;
                $scope.message = data.message;
            }
        });
    };

    $scope.logout = function() {
        $window.localStorage.removeItem('jwtToken');
    }
});

app.controller('createController', function($scope, $rootScope, $http, $window, $location,
    userInfoService, playlistInfoService, VideosService, Upload) {
    init();

    function init() {
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.playlist = true;
    }
    $scope.playlist_img = 'http://www.gsurgeon.net/wp-content/uploads/2016/01/hogu-7.jpg';

    // upload on file select or drop
    $scope.upload = function(file) {
        Upload.upload({
            url: '/upload',
            arrayKey: '', // default is '[i]'
            data: {
                file: file,
            }
        }).then(function(resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            $scope.playlist_img = resp.data.imgurl;
            $('#pictureModal').modal('hide');
        }, function(resp) {
            console.log('Error status: ' + resp.status);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

    $scope.queue = function(id, title) {
        VideosService.queueVideo(id, title);
        //    VideosService.deleteVideo($scope.history, id);
        $log.info('Queued id:' + id + ' and title:' + title);
    };

    $scope.delete = function(list, id) {
        VideosService.deleteVideo($scope.upcoming, id);
    };

    $scope.search = function() {
        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyCARc1XWs6s-bkrvh_Bdd3YPjjrWlDDSUw',
                type: 'video',
                videoEmbeddable: 'true',
                order: 'relevance',
                maxResults: '16',
                part: 'id,snippet',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
                q: this.query
            }
        }).success(function(data) {
            $scope.results = VideosService.listResults(data);
        }).error(function() {
            console.log('Search error');
        });
    }

    // create a blank object to handle form data.

    $scope.playlist = {};
    $scope.playlist_author = $rootScope.username;
    $scope.playlist_name = 'Playlist Name';
    $scope.playlist_tags = 'Tag1, Tag2';

    // calling our submit function.
    $scope.submitForm = function() {

        var tagjson = [];
        var tagSplit = $scope.playlist_tags.split(",");
        for (var i = 0; i < tagSplit.length; i++) {
            tagjson.push({
                "tag": tagSplit[i]
            });
        }
        var playlistPayload = {
            'img': $scope.playlist_img,
            'name': $scope.playlist_name,
            'playlist_author': $scope.playlist_author,
            'songs': $scope.upcoming,
            'tags': tagjson,
        }
        playlistPayload = JSON.stringify(playlistPayload);
        $http({
            method: 'POST',
            url: '/api/playlist',
            data: playlistPayload,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data) {
            if (data.errors) {
                // Showing errors.
                $scope.errorName = data.errors;
            } else {
              $rootScope.playlistID = data.playlist_id;
              $('#previewModal').modal('hide');
              $location.path('/play?playlist=' + data.playlist_id);
            }
        });
    };

    $scope.logout = function() {
        $window.localStorage.removeItem('jwtToken');
    }

});

app.controller('genreController', function($scope, $rootScope, $location, $http, userInfoService, playlistInfoService) {
    $location.search();
    $scope.filters = { };
    if ($location.search().genre){
      var genre = $location.search().genre
      $scope.filters = {'tag' : $location.search().genre};
    };
    $scope.customPlaylists = [];
    $scope.musicGenres = []
    playlistInfoService.getPlaylists().success(function(response) {
        $scope.customPlaylists = response;
        angular.forEach($scope.customPlaylists, function(tags) {
            angular.forEach(tags.tags, function(genre) {
                $scope.musicGenres.push({
                    tag: genre.tag
                });
            });
        });
    })


    $scope.loadPlaylist = function(playlist_id, next) {
        $http({
            method: 'GET',
            url: '/api/playlist/' + playlist_id
        }).then(function successCallback(response) {
            $rootScope.playlistID = response.data._id;
            console.log($rootScope.playlistID);
            $location.path('play');
        }, function errorCallback(response) {
            console.log('it dead');
        });
    }
});

app.controller('signupController', function($scope, $http, $rootScope, $location) {
  $rootScope.$on('$viewContentLoaded', function(){
      $('#preloader').fadeOut( "slow" );
});
    angular.element('body').addClass("gradient-bg-darkest");
//    $rootScope.hideit = true;
    // create a blank object to handle form data.
    $scope.user = {};
    // calling our submit function.
    $scope.submitForm = function() {
        // Posting data to php file
        $http({
            method: 'POST',
            url: '/api/signup',
            data: JSON.stringify($scope.user), //forms user object
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data) {
            if (data.errors) {
                // Showing errors.
                $scope.errorName = data.errors;
            } else {
                $location.path('/signin');
                $scope.message = data.message;
            }
        });
    };
});
app.controller('signinController', function($scope, $rootScope, $http, $location, $window, userInfoService) {
  $rootScope.$on('$viewContentLoaded', function(){
      $('#preloader').fadeOut( "slow" );
});
    angular.element('body').addClass("gradient-bg");
    $rootScope.hideit = true;
    $scope.user = {};
    $scope.submitForm = function() {
        $http({
            method: 'POST',
            url: '/api/authenticate',
            data: $.param($scope.user), //forms user object
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(data) {
            if (data.success) {
              $window.localStorage['jwtToken'] = data.token;
              userInfoService.getUserInfo();
             $location.path('/');
            } else {
              $scope.errorName = data.msg;
            }
        });
    };
});

// Controller
app.controller('VideosController', function($route, $scope, $rootScope, $http, $log, $location, userInfoService, playlistInfoService, VideosService) {

    $scope.loadPlaylist = function() {
        $http({
            method: 'PATCH',
            url: '/api/playlist/' + $location.search().playlist
        }).then(function successCallback(response) {
          VideosService.onYouTubeIframeAPIReady();
            $scope.playlist_img = response.data.img;
            $scope.playlist_name = response.data.name;
            $scope.playlist_genres = response.data.tags;
            var json = JSON.stringify(response.data.songs);
            $.each($.parseJSON(json), function() {
                VideosService.queueVideo(this.id,
                    this.title);
            });
        }, function errorCallback(response) {
            console.log('holy shit it broke');
        });
    }

    init();

    function init() {
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.history = VideosService.getHistory();
        $scope.playlist = true;
        $scope.loadPlaylist();
    }

    $scope.launch = function(id, title) {
        VideosService.launchPlayer(id, title);
        VideosService.archiveVideo(id, title);
        VideosService.deleteVideo($scope.upcoming, id);
        $log.info('Launched id:' + id + ' and title:' + title);
    };
    $scope.queue = function(id, title) {
        VideosService.queueVideo(id, title);
        VideosService.deleteVideo($scope.history, id);
        $log.info('Queued id:' + id + ' and title:' + title);
        $("input[type=text], textarea").val("");
        $scope.results = $scope.initial;
        $('#overlay-search').removeClass('open');
    };
    $scope.delete = function(list, id) {
        VideosService.deleteVideo($scope.upcoming, id);
    };
    $scope.search = function() {
        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyCARc1XWs6s-bkrvh_Bdd3YPjjrWlDDSUw',
                type: 'video',
                videoEmbeddable: 'true',
                order: 'viewCount',
                maxResults: '16',
                part: 'id,snippet',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
                q: this.query
            }
        }).success(function(data) {
            $scope.results = VideosService.listResults(data);
        }).error(function() {
            $log.info('Search error');
        });
    }
    $scope.tabulate = function(state) {
        $scope.playlist = state;
    }
    $scope.customPlaylists = [];
    $http.get('/api/playlist/').success(function(data) {
        $scope.customPlaylists = data;
    });

    $scope.$on('$locationChangeStart', function(event) {
      $('#sidebar').show()
      $('.menu-button').show()
      $('.slimScrollDiv').show()
      $('#minimal-animale').toggleClass('hide')
      $('#player').removeClass('full')
        $route.reload();
        $scope.upcoming.splice(0);
        $scope.history.splice(0);
        $rootScope.PlaylistID = 0;
    });

    $scope.nextSong = function() {
        $scope.launch($scope.upcoming[0].id, $scope.upcoming[0].title);
    };

    $scope.lastSong = function() {
        $scope.launch($scope.history[1].id, $scope.history[1].title);
    };

    $scope.addPlaylist = function(playlist_id) {
        $http({
            method: 'GET',
            url: '/api/playlist/' + playlist_id
        }).then(function successCallback(response) {
            var json = JSON.stringify(response.data.songs);
            $.each($.parseJSON(json), function() {
                VideosService.queueVideo(this.id,
                    this.title);
            });
            $('#overlay-playlist').removeClass('open');
        });
    }

    $('#history-button').click(function() {
        var $this = $(this);
        $this.toggleClass("active");

        if ($this.hasClass("active")) {
            $this.html("<i class=\"material-icons\">queue_music</i>");
            $("#history").show();
            $("#upcoming").hide();
        } else {
            $this.html("<i class=\"material-icons\">history</i>");
            $("#history").hide();
            $("#upcoming").show();
        }
    });


    $scope.playlistView = function() {
        $('#overlay-playlist').toggleClass('open');
    };

    $scope.minimalView = function() {
        $('#sidebar').toggle()
        $('.menu-button').toggle()
        $('.slimScrollDiv').toggle()
        $('#minimal-animale').toggleClass('show')
        $('#player').toggleClass('full')

    };
    $scope.searchView = function() {
      $('#overlay-search').toggleClass('open');
    };

    $("#nextPlaylistModal").on('shown.bs.modal', function() {
        setTimeout(function() {
            $('#nextPlaylistModal').modal('hide');
            $scope.loadPlaylist(
                '/playlists/aesthetic-playlist.json',
                true);
        }, 3000)
    });

    $scope.logout = function() {
        $window.localStorage.removeItem('jwtToken');
        console.log('who the fuck is scraeming log off at my house. show yourself, coward. I will never log off')
        $route.reload();
    }

});
