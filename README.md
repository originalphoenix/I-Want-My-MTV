# I-Want-My-MTV
Money for Nothing, Chicks for Free Youtube Jukebox

Jukebox spun off of juketube with a better layout and actually works.

Bugs 
- Refresh literally breaks angular, heck if I know why
- If minimalism is enabled on jukebox then it reflects the whole site
- Sometimes Jukebox gets angry during switching?

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
- Sign Up Page redirects to login page on successful submission
- Add validation for passwords (also hide passwords)
- Fix Continue Button to match everything else
- STRETCH GOAL: Social Sign In/Sign Up

Header/Footer Page (tv-tokyo.html)
- ng-cloak on any angular variables
- Add ability to put favorite tags in the sidebar

Home Page
- Most Played (add play count on playlist_load)

Genres Page 

Profile Page 
- FAVORITES I DON'T KNOW HOW TO DO THIS HECK
- Created.length and Favorites.length
- Need Ability to Go Directly to Active Tab
- Fix the Create Playlist Card (needs to look less like crap)

Create Playlist Page
- Search bar to have same UI as signup inputs
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

