## Inspiration

The Audiophile podcast _Song Exploder_ was a huge inspiration for this project. Its a simple but powerful idea. Inviting musicians to dissect their work piece by piece and explaining how sounds and ideas come together shows an entirely new depth to the medium of music. That concept directly inspired us to build a stem music breakdown tool that lets creators and listeners take apart tracks in a hands-on way, explore individual elements, and understand the craft behind the sounds. Just like how _Song Exploder_ reveals the stories behind songs, our tool aims to open up the building blocks of music in an intuitive, interactive format. 

## What it does
The **Unlayered Studio** app allows users to submit any song they want, break it apart, reconstruct it, and find deeper meaning in the music. Currently it splits the song into 4 different tracks, where the user can toggle streams, adjust volume, balance left/right channels, and see annotations for the song line by line. The biography and annotations of the song are sourced from the popular lyrical analysis site Genius, where fans cross-reference interviews and cultural knowledge to provide deep insight to the artist’s words.

## How we built it
We started by mapping out the user story, and from there we derived our product requirements document. We split the project into a frontend and backend project. Our backend takes audio files and uses machine learning algorithms to split the audio into high-quality stems of the input (vocals, guitar, drums, etc). The frontend takes these stems and provides a user interface to play around with these stems.

## Challenges we ran into
A big challenge we had early on was figuring out which versions of python and packages to use that all worked nicely together, as we used a wide array of packages and needed to find a version that worked unanimously. Similarly, we needed to find lots of specific libraries and APIs to make our vision come true. Audio splitting, lyrical timings, and open-source annotations of the song all needed to blend together, and this took a ton of work.

## Accomplishments that we're proud of
Our UI came out wonderfully. Once we had our app looking nice, it was only a matter of time until we developed the rest of our features to match. Also, the audio splitting worked much better than anticipated, which was a relief, as having poor audio in a music app would be a huge letdown.

## What we learned
We learned a ton about the intertwining of different data types, the connection of multiple API's, the depth of audio files, and the nuances to efficient developing with AI agents. 

## What's next for **Unlayered Studio**
In the future, we hope to add a MIDI viewer, playlist capabilities, and integration with popular streaming apps, like Apple Music or Spotify.
