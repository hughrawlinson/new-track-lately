/* Author: Hugh Rawlinson

© Code O'Clock Industries :P

*/

$(document).ready(function(){
    $('#friendsList').on('click','li',function(){
        playFriendsTrack($(this).attr('id'));
    });
    $('#friendsList').on('mouseenter mouseleave','li',function(){
        $(this).toggleClass('friendsListLiOver','slow')
    });
})

var track;
var timeout = true;

var playTune = function(artist, title,friendid) {
    track = window.tomahkAPI.Track(title, artist, {
        disabledResolvers: ["Soundcloud"],
        handlers: {
            onplayable: function() {
                track.play();
            },
            onended: function() {
                var nextfriendid = $('#'+friendid).next().attr('id');
                playFriendsTrack(nextfriendid);
            },
        }
    });
    document.getElementById("player").innerHTML = "";
    document.getElementById("player").appendChild(track.render());
}

function populateFriends() {
    FB.api('/me/friends', function(response) {
        if(response.data) {
            $.each(response.data,function(index,friend) {
                FB.api('/'+friend.id+"/music.listens", function(response) {
                    if(response.data.length>0){
                        log('<li id="'+friend.id+'"><span class="name">'+friend.name+'</span></li>\n');
                        $("#friendsList").append('<li id="'+friend.id+'"><span class="name">'+friend.name+'</span></li>\n');
                        if(timeout){
                          setTimeout(function(){
                            var options = {
                              valueNames: [ 'name' ]
                            };

                            var featureList = new List('friends-list', options);
                            featureList.sort('name', { asc: true });
                          },3000);
                          timeout = false;
                        }
                    }
                });
            });
        }
        else {
            log(response);
            alert("Error!");
            //document.location.reload(true);
        }
    });
}

var playFriendsTrack = function(friend){
    FB.api("/"+friend+"/music.listens", function(response) {
        var songname = response.data[0].data.song.title;
        var artistname = "";
        FB.api(response.data[0].data.song.id,function(trackdata){
            var musicianobj = trackdata.data.musician;
            artistname = musicianobj[0].name;
            if(artistname.length <= 0){
                alert("Error! Please try another friend.")
            }
            else{
                playTune(artistname,songname,friend);
                $("#friendName").text(response.data[0].from.name);
                $("#songName").text(artistname + " - " + songname);
                if($('#share').is(':checked')){
                    FB.api('/me/music.listens','post',{
                        song: response.data[0].data.song.url
                    });
                }
            }
        });
    });
}

var facebookLogin = function() {
    FB.login(function() {
      loggedInToFacebook();
  }, {
      scope: 'publish_actions,friends_actions.music'
  }
  );
}

var loggedInToFacebook = function() {
  populateFriends();
  $('#loggedIn').show();
}

var facebookLogout = function() {
  FB.logout();
  $('#loggedIn').hide();
  track.stop();
}

////////////////////////
//FACEBOOK LOGIN STUFF//
////////////////////////

window.fbAsyncInit = function() {
  // init the FB JS SDK
  FB.init({
    appId: '341862115846576',
    // App ID from the App Dashboard
    //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
    status: true,
    // check the login status upon init?
    cookie: true,
    // set sessions cookies to allow your server to access the session?
    xfbml: true // parse XFBML tags on this page?
});

  FB.getLoginStatus(function(response) {
    if(response.status === 'connected') {
      var uid = response.authResponse.userID;
      var accessToken = response.authResponse.accessToken;
      loggedInToFacebook();
  } else if(response.status === 'not_authorized') {
      // the user is logged in to Facebook, 
      // but has not authenticated your app
  } else {
      // the user isn't logged in to Facebook.
  }
});
  // Additional initialization code such as adding Event Listeners goes here
};

// Load the SDK's source Asynchronously
(function(d, debug) {
  var js, id = 'facebook-jssdk',
  ref = d.getElementsByTagName('script')[0];
  if(d.getElementById(id)) {
    return;
}
js = d.createElement('script');
js.id = id;
js.async = true;
js.src = "http://connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));