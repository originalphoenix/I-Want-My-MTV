# I-Want-My-MTV
Money for Nothing, Chicks for Free Youtube Jukebox

Jukebox spun off of juketube with a better layout and actually works.

Bugs 
- Front End Validation via Parsley Broke
- Need to think about how to enforce unique usernames
- Edit Server so if someone goes to direct URL it doesn't serve a bad GET request

API 
- Users that create playlists also delete them
- Users that create playlists can only edit them
- Lock down GET so that only the app can make requests to it

Overall App Functionality
- Ability to pull up user profiles via direct Link
- Responsiveness
- ANIMATIONS ANIMATIONS ANIMATIONS HECK YEAH
- Error Handling in General lmao
- Hide-show favorite hearts depending on if the user has favorited them
- Ability to unfavorite things

Sign Up/Sign In Pages 
- Sign Up Page needs Photo Uploads to POST (currently doesn't POST)
- Sign Up Photo Upload needs to work
- Sign Up Page needs email confirmation & I am not a Robot Verification
- Sign Up Page redirects to login page on successful submission
- Add validation for passwords (also hide passwords)
- STRETCH GOAL: Social Sign In/Sign Up

Header/Footer Page (tv-tokyo.html)
- ng-cloak on any angular variables
- Login is a Modal Box

Home Page

Genres Page 
- Sort by Alphabetical Order

Profile Page 
- Need Ability to Go Directly to Active Tab
- Fix the Create Playlist Card (needs to look less like crap)

Create Playlist Page
- Play button takes person to the youtube video? or maybe fills the search box with the video preview? idk

Jukebox UI/UX
- Flash of last playlist on load
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

