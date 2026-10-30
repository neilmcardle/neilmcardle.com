# Local changes to vendored code

`webm-muxer.js` (from webm-muxer 5.1.4) has two small changes so it can write video with a transparent background:

1. `addVideoChunkRaw` takes a fifth argument, `additions`, and passes it through. The library already wrote BlockAdditions, but only for subtitles.
2. A video frame written with additions goes into a BlockGroup. Delta frames there now get a ReferenceBlock, so players do not mistake them for keyframes.

`mp4-muxer.js` and `fflate.js` are unchanged.
