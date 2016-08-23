var app = angular.module('JukeTubeApp', ['ngRoute', 'xeditable']);
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
// Routes
app.config(function($routeProvider) {
    $routeProvider
    // route for the home page
        .when('/', {
            templateUrl: 'theme/pages/home.html',
            controller: 'mainController'
        }).when('/signup', {
            templateUrl: 'signup.html',
            controller: 'signupController'
        }).when('/signin', {
            templateUrl: 'signin.html',
            controller: 'signinController'
        })
        // route for the profile page
        .when('/profile', {
            templateUrl: 'theme/pages/profile.html',
            controller: 'profileController'
        })
        // route for the genre page
        .when('/create', {
            templateUrl: 'theme/pages/playlist-create.html',
            controller: 'createController'
        })
        // route for the genre page
        .when('/play', {
            templateUrl: 'theme/pages/jukebox.html',
            controller: 'VideosController'
        })
        // route for the genre page
        .when('/genres', {
            templateUrl: 'theme/pages/genres.html',
            controller: 'VideosController'
        });
});

//USER AUTH
// WE FACTORIES NOW BOI
app.factory('userInfoService', function($http, $window, $rootScope) {
  $rootScope.hideit = false;
  return {
    getUserInfo: function() {$http({
        method: 'GET',
        url: '/api/memberinfo',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $window.localStorage['jwtToken']
        }
    }).success(function(data) {
        if (data.errors) {
            $scope.errorName = data.errors;
            $rootScope.loggedout = true;
        } else {
            $rootScope.loggedout = false;
            $rootScope.username = data.username;
            $rootScope.firstname = data.firstname;
            $rootScope.lastname = data.lastname;
            $rootScope.profilepic = data.profilepic;
            $rootScope.location = data.location;
            $rootScope.about = data.about;
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
app.service('VideosService', ['$window', '$rootScope', '$log', '$http',
    function($window, $rootScope, $log, $http) {
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
            var playlist_id = $rootScope.playlistID;
            $http({
                method: 'GET',
                url: '/api/playlist/' + playlist_id
            }).then(function successCallback(response) {
                youtube.player.cueVideoById(response.data.songs[0].id);
                youtube.videoId = response.data.songs[0].id;
                youtube.videoTitle = response.data.songs[0].title;
                youtube.player.playVideo();
                service.archiveVideo(upcoming[0].id, upcoming[0]
                    .title);
                service.deleteVideo(upcoming, upcoming[0].id);

            });
            $log.info('YouTube Player is ready');
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
            return results;
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
    userInfoService.getUserInfo();
    $scope.customPlaylists = [];
    playlistInfoService.getPlaylists().success(function(data) {
        $scope.customPlaylists = data;
    });
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
    $rootScope.logout = function() {
    console.log('who the fuck is scraeming log off at my house. show yourself, coward. I will never log off')
    $window.localStorage.removeItem('jwtToken');
    userInfoService.getUserInfo();
    $window.location.reload(); //This is not the angular way, but it's my way, think of a better way soon
    }
});
app.controller('profileController', function($scope, $http, $window,
    userInfoService, playlistInfoService) {
    $scope.customPlaylists = [];
    playlistInfoService.getPlaylists().success(function(data) {
        $scope.customPlaylists = data;
    });
    $scope.logout = function() {
    $window.localStorage.removeItem('jwtToken');
    }
});

app.controller('createController', function($scope, $rootScope, $http, $window,
    userInfoService, playlistInfoService, VideosService) {
    init();

    function init() {
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.playlist = true;
    }



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
            $log.info('Search error');
        });
    }

    // create a blank object to handle form data.

    $scope.playlist = {};
    $scope.playlist_name = 'Playlist Name';
    $scope.playlist_tags = 'Tag1, Tag2';
    $scope.playlist_img = 'http://www.gsurgeon.net/wp-content/uploads/2016/01/hogu-7.jpg';

    // calling our submit function.
    $scope.submitForm = function() {

        var tagjson = [];
        var tagSplit = $scope.playlist_tags.split(",");
        for (var i = 0; i < tagSplit.length; i++) {
            tagjson.push({
                "tag": tagSplit[i]
            });
        }

        console.log(tagjson);

        var playlistPayload = {
            'img': $scope.playlist_img,
            'name': $scope.playlist_name,
            'playlist_author': $rootScope.username,
            'songs': $scope.upcoming,
            'tags': tagjson,
        }
        playlistPayload = JSON.stringify(playlistPayload);
        console.log(playlistPayload);
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
                $scope.message = data.message;
            }
        });
    };

    $scope.logout = function() {
    $window.localStorage.removeItem('jwtToken');
    }

});

app.controller('genreController', function($scope) {});
app.controller('signupController', function($scope, $http, $rootScope) {
  angular.element('body').addClass("gradient-bg-darkest");
  $rootScope.hideit = true;
    // create a blank object to handle form data.
    $scope.user = {};
    // calling our submit function.
    $scope.submitForm = function() {
        // Posting data to php file
        $http({
            method: 'POST',
            url: '/api/signup',
            data: $scope.user, //forms user object
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
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
});
app.controller('signinController', function($scope, $rootScope, $http, $location, $window, userInfoService) {
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
            if (data.errors) {
                $scope.errorName = data.errors;
            } else {
                $window.localStorage['jwtToken'] = data.token;
                userInfoService.getUserInfo();
                $location.path('/');
            }
        });
    };
});

// Controller
app.controller('VideosController', function($route, $scope, $rootScope, $http, $log, userInfoService, playlistInfoService, VideosService) {
    $scope.loadPlaylist = function(playlist_id, next) {
        $http({
            method: 'GET',
            url: '/api/playlist/' + playlist_id
        }).then(function successCallback(response) {
            VideosService.onYouTubeIframeAPIReady();
            $scope.upcoming.splice(0);
            var json = JSON.stringify(response.data.songs);
            $.each($.parseJSON(json), function() {
                VideosService.queueVideo(this.id,
                    this.title);
            });
            $('#overlay-playlist').removeClass('open');
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
        $scope.loadPlaylist($rootScope.playlistID);
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
                order: 'relevance',
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
        $route.reload();
        $scope.upcoming.splice(0);
        $scope.history.splice(0);
        $rootScope.PlaylistID = 0;
    });

    $scope.historyView = function() {
        var $this = $(this);
        $this.toggleClass("active");
        consloe.log('history');
        if ($this.hasClass("active")) {
            $this.html("<i class=\"material-icons\">queue_music</i>");
            $("#history").show();
            $("#upcoming").hide();
        } else {
            $this.html("<i class=\"material-icons\">history</i>");
            $("#history").hide();
            $("#upcoming").show();
        }
    };

    $scope.searchView = function() {
        $('#overlay-search').toggleClass('open')
    };

    $scope.playlistView = function() {
        $('#overlay-playlist').toggleClass('open');
    };

    $scope.minimalView = function() {
        $('#sidebar').toggle()
        $('.menu-button').toggle()
        $('#minimal-animale').toggleClass('show')
        $('#player').toggleClass('full')

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
