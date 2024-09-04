# MPAi
MPAi in JS using WASM

## Setting up study URLs

MPAi sends recordings to the server only if a study participant ID and password are specified in the URL.

```
https://uoa-eresearch.github.io/MPAi/app?participant_id=yourid&password=yourpasswordhere&attemptsAllowed=1#/audiopermission
```

There are three parameters you can specify:
* `participant_id` - The unique ID for each participant.
* `password` - The password to upload the recording.
* `attemptsAllowed` - The number of attempts the participant should make at pronouncing each vowel. Defaults to 5.