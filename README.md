# I-Want-My-MTV
Money for Nothing, Chicks for Free Youtube Jukebox

Jukebox spun off of juketube with a better layout and actually works.

Design Inspiration: https://www.behance.net/gallery/19435591/Songoroo

Jukebox UI/UX
- Clean up CSS
- Add CSS Animations to everything
- Show Icon where play button should be while youtube video is loading
- When youtube status is ended, show a gradient background instead of the youtube screen
- Fix the Modal for "playlist has ended" / Style it also

App UI/UX
- Shove angular into everything once endpoints are set up
- Create Playlist Page still is ugly but I don't know what to do.
- Fixed Width for Playlist Cards
- Create New Playlist needs to be restyled
- More Animations MORE ANIMATIONS

App Functionality
- Load Playlist from another screen into the Jukebox
- Manage User Tokens to Pull up Data
- Add Settings Tab to Profile Page (only visible if the profile belongs to the logged in user) 
- Favorites Need to Happen?
- Save Playlist Page needs wired up
- Search Page needs to be added and implemented
- Profile URLs and Playlist URLs need to be shareable
- If Genre is clicked, genre page needs to pull up that genre automatically
- Genre only picks from all available tags
- 404 Handling
- Home only displays genres that user has liked in the past
- Drag and Drop Reordering on Playlist Page

API 
- Users that create playlists also delete them
- Users that create playlists can only edit them
- Lock down GET so that only the app can make requests to it
- Need some way of relating "favorites" to a user account, not sure how yet :/ 

FUNCTIONALITY
- API endpoints instead of JSON files
- Ability to save playlists with album art and tags
- Ability to loop playlists from the start
- Load next playlist via tags
- Add Favorites
- Live Search from youtube
- Give weight to "official" and "MV" 
- Drag and Drop Reordering
- User Accounts that save playlis
