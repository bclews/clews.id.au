+++
title = 'Extracting Audio From YouTube Videos'
date = 2024-05-18T16:24:58+10:00
draft = false
+++


I recently wanted to extract the audio tracks from some YouTube videos. The [youtube-dl](https://ytdl-org.github.io/youtube-dl/) command-line application was the perfect tool for the job.

[Installation](https://github.com/ytdl-org/youtube-dl#installation) on macOS was straightforward (at the time of writing, this installed version 2019.04.24):
```bash
brew install youtube-dl
```

The audio from a YouTube video is extracted by using the _extract audio_ option:
```bash
youtube-dl --extract-audio <video_url>
```

The default audio format is Ogg, however you can specify alternative formats by using the _audio format_ option:
```bash
youtube-dl --extract-audio --audio-format mp3 <video_url>
```

The [audio format options](https://github.com/ytdl-org/youtube-dl#options) are aac, flac, mp3, m4a, opus, vorbis, or wav.

An example command:
```bash
youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
