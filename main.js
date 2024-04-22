/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
// https://webaudiodemos.appspot.com/AudioRecorder/js/main.js
// modified by Justine Hui 2021
// modified by Nick Young 2024

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var speaker = "Female";

function initPlot() {
    Papa.parse("kaumatua_monoVowel_formantData.csv", {
        header: true,
        download: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            results = results.data.filter(r => r.length == "long" && r.speaker == speaker.toLowerCase())
            console.log(results)
            var data = [{
                x: results.map(r => hzToBark(r["F2_mean"])),
                y: results.map(r => hzToBark(r["F1_mean"])),
                autocolorscale: true,
                text: results.map(r => r.vowel),
                //textposition: 'top',
                textfont: {
                    size: 20
                },
                mode: 'text',
                type: 'scatter'
            }];
            var layout = {
                xaxis: {
                    autorange: 'reversed',
                    visible: false,
                    // female: xmax = 16.5, xmin = 6.5, ymax = 8, ymin = 3
                    // male: xmax = 15.5    xmin = 5.5    ymax = 7.5    ymin = 2.5
                    range: [6.5, 16.5],
                    title: "F2 (Bark)"
                },
                yaxis: {
                    autorange: 'reversed',
                    visible: false,
                    range: [3, 8],
                    title: "F1 (Bark)"
                },
                showlegend: false
            }
            Plotly.newPlot('plot', data, layout, {staticPlot: true});
        }
    });
}
initPlot()

$("#speaker").change(function () {
    speaker = this.value;
    initPlot()
})

var sample_lookup = {
    "Female|a": "oldfemale-word-taa-R001M.wav",
    "Female|e": "oldfemale-word-hee-R001M.wav",
    "Female|i": "oldfemale-word-hii-R001M.wav",
    "Female|o": "oldfemale-word-poo-R001M.wav",
    "Female|u": "oldfemale-word-tuu-R001M.wav",
    "Male|a": "oldmale-word-taa-K004M.wav",
    "Male|e": "oldmale-word-hee-K004M.wav",
    "Male|i": "oldmale-word-hii-K004M.wav",
    "Male|o": "oldmale-word-poo-K004M.wav",
    "Male|u": "oldmale-word-tuu-K004M.wav"
}

$("#play").click(function () {
    var vowel = $("#vowel").val()
    var speaker = $("#speaker").val()
    var filename = sample_lookup[`${speaker}|${vowel}`]
    var audio = new Audio(`samples/${filename}`)
    audio.play()
})

$("#erase").click(function () {
    initPlot()
})

// cache WASM
praat({ arguments: ["--version"] })

function saveAudio() {
    //audioRecorder.exportWAV( doneEncoding );
    // could get mono instead by saying
    audioRecorder.exportMonoWAV(doneEncoding);

}

function drawBuffer(width, height, context, data) {
    var step = Math.ceil(data.length / width);
    var amp = height / 2;
    context.fillStyle = "silver";
    context.clearRect(0, 0, width, height);
    for (var i = 0; i < width; i++) {
        var min = 1.0;
        var max = -1.0;
        for (j = 0; j < step; j++) {
            var datum = data[(i * step) + j];
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
        context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
}

function gotBuffers(buffers) {
    var canvas = document.getElementById("wavedisplay");
    var sampleRate = audioContext.sampleRate

    drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

    // the ONLY time gotBuffers is called is right after a new recording is completed -
    // so here's where we should set up the download.
    audioRecorder.exportWAV(doneEncoding);
}

function hzToBark(freqHz) {
    var bark = 26.81 / (1 + (1960 / freqHz)) - 0.53 //#((26.81 * freqHz)/(1960 + freqHz)) - 0.53 #using Traunmüller1990
    return bark
}

function doneEncoding(blob) {

    //var audioUrl = URL.createObjectURL(blob);
    //audioRecorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    console.log("recorded")
    console.log(blob)
    praat({ noInitialRun: true }).then(async function (Module) {
        window.Module = Module
        var response = await fetch("process.praat")
        var content = await response.text()
        Module.FS.writeFile("process.praat", content)
        var content = await blob.arrayBuffer()
        content = new Uint8Array(content)
        Module.FS.writeFile("1.wav", content)
        Module.callMain(["--run", "process.praat", "1.wav", "results.csv"])
        var results = Module.FS.readFile("results.csv", { encoding: "utf8" })
        results = await Papa.parse(results, {
            header: true,
            dynamicTyping: true
        }).data
        console.log(results)
        results = results.filter(r => r.Pitch > 50 && r["F1(Hz)"] > 0 && r["F2(Hz)"] > 0)
        console.log(results)
        var data = [{
            x: results.map(r => hzToBark(r["F2(Hz)"])),
            y: results.map(r => hzToBark(r["F1(Hz)"])),
            mode: 'markers',
            type: 'scatter'
        }];
        Plotly.addTraces('plot', data);
    })
}

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    fetch("samples/oldfemale-word-hee-R001M.wav").then(r => r.blob()).then(doneEncoding)
}

function toggleRecording(e) {
    if (e.classList.contains("recording")) {
        // stop recording
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.getBuffers(gotBuffers);
    } else {
        // start recording
        if (!audioRecorder)
            return;
        e.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
    }
}

window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        console.log('Space pressed'); //whatever you want to do when space is pressed

        if (!document.getElementById('record').classList.contains("recording")) {
            // start recording
            document.activeElement.blur();
            if (!audioRecorder)
                return;
            document.getElementById('record').classList.add("recording");
            audioRecorder.clear();
            audioRecorder.record();

            //recording = 1;
        }
    }
})
window.addEventListener('keyup', event => {
    if (event.code === 'Space') {
        console.log('Space up'); //whatever you want to do when space is pressed
        audioRecorder.stop();
        document.getElementById('record').classList.remove("recording");
        audioRecorder.getBuffers(gotBuffers);

        //recording = 0;
    }
})

$("#record").on("mousedown touchstart", function () {
    toggleRecording(this);
})

$("#record").on("mouseup touchend", function () {
    toggleRecording(this);
})

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame(rafID);
    rafID = null;
}

function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData);

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor(i * multiplier);
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j < multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            analyserContext.fillStyle = "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
    }

    rafID = window.requestAnimationFrame(updateAnalysers);
}



function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    //audioInput = convertToMono(audioInput);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect(analyserNode);

    audioRecorder = new Recorder(inputPoint, { numChannels: 1 });

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect(zeroGain);
    zeroGain.connect(audioContext.destination);
    updateAnalysers();
}

function initAudio() {
    // One-liner to resume playback when user interacted with the page.
    window.addEventListener('click', function () {
        if (audioContext.state == 'suspended')
            audioContext.resume().then(() => {
                console.log('Playback resumed successfully');
                //Shiny.setInputValue("recordingStarted", 0);
            });
    });

    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;


    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function (e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio);

/*
function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}
function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}
*/