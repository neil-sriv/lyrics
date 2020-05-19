# [APP NAME] ~Spotify Lyrics~

Download Expo on your phone and make sure you have yarn installed on your computer.

### Development
` cd app
  expo start `

### Feature Goals
 - Loading Masks
 - Logo
 - App name
 - Frontend Layout
 - Better log in procedure
 - Playlist support (choose a playlist to play)
 - Shuffle, repeat toggle support

### Known Bugs
 - Canceling out of AuthSession crashes app
 - User seeks to a position on Spotify App, auto-refresh of song will fail for that song
   - This means that it will call refresh once the actual song would have finished
   - Luckily bc refresh is "smart" it will only happen until refresh function is called the next time
     - This could be a leftover fired refresh from earlier or pressing refresh
     - Or if a user seeks back in a track then the refresh would fire earlier than necessary but that would trigger another refresh call with the correct timeout duration