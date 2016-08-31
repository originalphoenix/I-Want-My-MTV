# I-Want-My-MTV
Money for Nothing, Chicks for Free Youtube Jukebox

Jukebox spun off of juketube with a better layout and actually works.

Design Inspiration: https://www.behance.net/gallery/19435591/Songoroo

API 
- Users that create playlists also delete them
- Users that create playlists can only edit them
- Lock down GET so that only the app can make requests to it
- Need some way of relating "favorites" to a user account, not sure how yet :/ 

Overall App Functionality
- Ability to pull up user profiles & playlists via direct link
- Get rid of that weird # thing in URLs
- Responsiveness
- ANIMATIONS ANIMATIONS ANIMATIONS HECK YEAH
- Error Handling in General lmao

Sign Up/Sign In Pages 
- If Token is Set User Cannot go to Sign In or Sign Up
- Sign Up Page needs Photo Uploads to POST (currently doesn't POST)
- Sign Up Photo Upload needs to work
- Sign Up Page needs email confirmation & I am not a Robot Verification
- STRETCH GOAL: Social Sign In/Sign Up

Header/Footer Page (tv-tokyo.html)
- ng-cloak on any angular variables
- Add ability to put favorite tags in the sidebar
- Add Loading Overlay for ng-cloak (take from jukebox.html)

Home Page
- Show Playlists that have "featured" set to true
- Most Played (add play count on playlist_load)

Genres Page 

Profile Page 
- FAVORITES I DON'T KNOW HOW TO DO THIS HECK
- Fix the Create Playlist Card (needs to look less like crap)

Create Playlist Page
- Save needs to return playlistID and redirect user to the new playlist
- Play button takes person to the youtube video? or maybe fills the search box with the video preview? idk

Jukebox UI/UX
- Clean up CSS
- Add CSS Animations to everything
- Show Icon where play button should be while youtube video is loading
- When youtube status is ended, show a gradient background instead of the youtube screen
- Fix the Modal for "playlist has ended" / Style it also
- Modal picks first playlist with similar tags

======

Polish
- Clean up CSS
- Clean up JS

App Functionality
- Favorites Need to Happen?
- Search Page needs to be added and implemented
- Profile URLs and Playlist URLs need to be shareable
- If Genre is clicked, genre page needs to pull up that genre automatically
- Genre only picks from all available tags
- Home only displays genres that user has liked in the past
- Drag and Drop Reordering on Playlist Page

FUNCTIONALITY
- Ability to save playlists with album art and tags
- Ability to loop playlists from the start
- Load next playlist via tags
- Add Favorites
- Live Search from youtube
- Give weight to "official" and "MV" 
- Drag and Drop Reordering
