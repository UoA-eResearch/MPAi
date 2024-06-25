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
var lastRecording;
var traces = [];
var layout = {};

function initPlot() {
    Papa.parse("kaumatua_monoVowel_formantData.csv", {
        header: true,
        download: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            results = results.data.filter(r => r.length == "long" && r.speaker == speaker.toLowerCase())
            console.log(results)
            traces = [{
                x: results.map(r => hzToBark(r["F2_mean"])),
                y: results.map(r => hzToBark(r["F1_mean"])),
                autocolorscale: true,
                text: results.map(r => r.vowel),
                //textposition: 'top',
                textfont: {
                    size: 20
                },
                mode: 'text',
                type: 'scatter',
                hoverinfo: "none"
            }];
            shapes = []
            for (var r of results) {
                var step = .05;
                for (i = 0; i <= 1; i += step) {
                    shapes.push({
                        type: "circle",
                        xref: "x",
                        yref: "y",
                        x0: hzToBark(r["F2_mean"] - r["F2_sd"] * i),
                        y0: hzToBark(r["F1_mean"] - r["F1_sd"] * i),
                        x1: hzToBark(r["F2_mean"] + r["F2_sd"] * i),
                        y1: hzToBark(r["F1_mean"] + r["F1_sd"] * i),
                        opacity: step / 2,
                        fillcolor: 'red',
                        line: {
                            width: 0
                        }
                    })
                }
            }
            layout = {
                shapes: shapes,
                annotations: [
                    {
                        xref: 'paper',
                        yref: 'paper',
                        x: 0,
                        xanchor: 'right',
                        y: 1,
                        yanchor: 'bottom',
                        text: 'Closed',
                        showarrow: false
                    },
                    {
                        xref: 'paper',
                        yref: 'paper',
                        x: 0,
                        xanchor: 'right',
                        y: 0,
                        yanchor: 'bottom',
                        text: 'Open',
                        showarrow: false
                    },
                    {
                        xref: 'paper',
                        yref: 'paper',
                        x: 0,
                        xanchor: 'left',
                        y: 0,
                        yanchor: 'top',
                        text: 'Front',
                        showarrow: false
                    },
                    {
                        xref: 'paper',
                        yref: 'paper',
                        x: 1,
                        xanchor: 'left',
                        y: 0,
                        yanchor: 'top',
                        text: 'Back',
                        showarrow: false
                    }
                ],
                dragmode: false,
                hoverinfo: "none",
                hovermode: "x",
                clickmode: "event",
                xaxis: {
                    showticklabels: false,
                    showgrid: false,
                    zeroline: false,
                    //visible: false,
                    // female: xmax = 16.5, xmin = 6.5, ymax = 8, ymin = 3
                    // male: xmax = 15.5    xmin = 5.5    ymax = 7.5    ymin = 2.5
                    range: [16.5, 5.5],
                    //title: "F2 (Bark)"
                    title: "Tongue Position (F2)"
                },
                yaxis: {
                    showticklabels: false,
                    showgrid: false,
                    zeroline: false,
                    //visible: false,
                    range: [9, 2],
                    //title: "F1 (Bark)",
                    title: "Mouth Openness (F1)"
                },
                /*
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 0,
                },
                */
                showlegend: false
            }
            Plotly.newPlot('plot', traces, layout, {
               displayModeBar: false,
               doubleClick: false,
               staticPlot: true,
               responsive: true
            })
        }
    });
}
initPlot()

$("#plot").mousemove(function (evt) {
    var bb = evt.target.getBoundingClientRect();
    var l = this._fullLayout.margin.l;
    var t = this._fullLayout.margin.t;
    var x = this._fullLayout.xaxis.p2d(evt.originalEvent.clientX - bb.left - l);
    var y = this._fullLayout.yaxis.p2d(evt.originalEvent.clientY - bb.top - t);
    var trace = traces[traces.length - 2];
    if (!trace) return;
    var index = 0;
    var minDist = Infinity;
    for (var i = 0; i < trace.x.length; i++) {
        var dist = Math.sqrt((trace.x[i] - x) ** 2 + (trace.y[i] - y) ** 2)
        if (dist < minDist) {
            minDist = dist;
            index = i;
        }
    }
    trace.marker.line.width = trace.x.map((x, i) => i == index ? 2 : 0)
    Plotly.react('plot', traces, layout);

    Plotly.Fx.hover('debug_plot',[
        {curveNumber:0, pointNumber:index},
        {curveNumber:1, pointNumber:index},
        {curveNumber:2, pointNumber:index}
    ]);
})

$("#plot").click(function (evt) {
    var bb = evt.target.getBoundingClientRect();
    var l = this._fullLayout.margin.l;
    var t = this._fullLayout.margin.t;
    var x = this._fullLayout.xaxis.p2d(evt.originalEvent.clientX - bb.left - l);
    var y = this._fullLayout.yaxis.p2d(evt.originalEvent.clientY - bb.top - t);
    var trace = traces[traces.length - 1];
    var minIdx = 0;
    var minDist = Infinity;
    for (var i = 0; i < trace.x.length; i++) {
        var dist = Math.sqrt((trace.x[i] - x) ** 2 + (trace.y[i] - y) ** 2)
        if (dist < minDist) {
            minDist = dist;
            minIdx = i;
        }
    }
    var vowel = trace.text[minIdx]
    console.log("Clicked", vowel, minDist)
    var speaker = $("#speaker").val()
    var filename = "samples/" + sample_lookup[`${speaker}|${vowel}`]
    fetch(filename).then(r => r.blob()).then(async function(r) {
        new Audio(URL.createObjectURL(r)).play()
        await doneEncoding(r, false)
    })
})

$("#speaker").change(function () {
    speaker = this.value;
    initPlot()
})

$("#vowel").change(function () {
    var vowel =  $("#vowel").val()
    var speaker = $("#speaker").val()
    var filename = "samples/" + sample_lookup[`${speaker}|${vowel}`]
    fetch(filename).then(r => r.blob()).then(async function(r) {
        new Audio(URL.createObjectURL(r)).play()
        await doneEncoding(r, false)
    })
});

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

$("#compare").click(function () {
    var vowel = $("#vowel").val()
    var speaker = $("#speaker").val()
    var filename = sample_lookup[`${speaker}|${vowel}`]
    var audio = new Audio(`samples/${filename}`)
    audio.play()
    audio.addEventListener("ended", function () {
        new Audio(URL.createObjectURL(lastRecording)).play()
    });
});

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
    console.log(buffers)
    var canvas = document.getElementById("wavedisplay");
    var sampleRate = audioContext.sampleRate

    drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

    // the ONLY time gotBuffers is called is right after a new recording is completed -
    // so here's where we should set up the download.
    //audioRecorder.exportWAV(doneEncoding);
    audioRecorder.exportMonoWAV(doneEncoding);
}

function hzToBark(freqHz) {
    var bark = 26.81 / (1 + (1960 / freqHz)) - 0.53 //#((26.81 * freqHz)/(1960 + freqHz)) - 0.53 #using Traunmüller1990
    return bark
}

function parse_FMS(fms) {
    var lines = fms.split("\n")
    var results = [];
    for (var line of lines) {
        if (!line) continue;
        var bits = line.split("\t")
        var result = {}
        result["time"] = parseFloat(bits[0].trim())
        var formants = bits[1].split(" ")
        for (var i = 0; i < formants.length; i++) {
            result[`F${i + 1}(Hz)`] = parseInt(formants[i])
        }
        var bandwidths = bits[2].split(" ")
        for (var i = 0; i < bandwidths.length; i++) {
            result[`B${i + 1}(Hz)`] = parseInt(bandwidths[i])
        }
        results.push(result)
    }
    return results
}

function parse_F0(xassp) {
    var lines = xassp.split("\n")
    var results = [];
    for (var i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        var bits = lines[i].split("\t")
        var result = {}
        result["time"] = parseFloat(bits[0].trim())
        result["F0(Hz)"] = parseFloat(bits[1])
        results.push(result)
    }
    return results;
}

// Cache WASM
ksvF0({arguments:["-X"]})
forest({arguments:["-X"]})

// https://api-proxy.auckland-cer.cloud.edu.au/MPAi_API/docs#/default/upload__post
const urlParams = new URLSearchParams(window.location.search);
const password = urlParams.get('password');
const participant_id = urlParams.get('participant_id');

async function doneEncoding(blob, post=true) {
    $("#compare").prop('disabled', false);
    if (post) lastRecording = blob;

    //var audioUrl = URL.createObjectURL(blob);
    //audioRecorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    console.log(blob)
    var content = await blob.arrayBuffer()
    content = new Uint8Array(content)
    var start = performance.now()

    ksvF0({noInitialRun: true}).then(async function(Module) {
        Module.FS.writeFile("1.wav", content)
        var args = [
            "1.wav", // input file
            "-oA", // output in XASSP ASCII format
        ]
        if (speaker == "Female") {
            args.push("-g=f")
        } else {
            args.push("-g=m")
        }
        Module.callMain(args)
        var pitch_results = parse_F0(Module.FS.readFile("1.f0", {encoding: "utf8"}))
        forest({noInitialRun: true}).then(async function(Module) {
            Module.FS.writeFile("1.wav", content)
            var args = [
                "1.wav", // input file
                "-oA", // output in plain ASCII format
                //"-L=49", // set effective length of analysis window to <dur> ms (default: 20.0)
                "-n=2", // set number of output formants to <num> (default: 4;  maximum: 8 or half the LP order)
                //"-p=-0.95", // set pre-emphasis factor to <val> (-1 <= val <= 0) (default: dependent on sample rate and nominal F1)
                //"-s=10", // set analysis window shift to <dur> ms (default: 5.0)
                //"-t=70" //  set silence threshold (no analysis) to <num> dB (default: 0.0 dB)
            ]
            if (speaker == "Female") {
                args.push("-f")
            }
            Module.callMain(args)
            var results = parse_FMS(Module.FS.readFile("1.fms", {encoding: "utf8"}))
            console.log(results)
            for (var i = 0; i < results.length; i++) {
                results[i]["F0(Hz)"] = pitch_results[i]["F0(Hz)"]
            }
            results = results.filter(r => r["F0(Hz)"] > 0 && r["F1(Hz)"] > 0 && r["F2(Hz)"] > 0)
            if (results.length == 0) {
                console.warn("No formants detected")
                $("#status").html('<div class="alert alert-danger" role="alert">No formants detected - is your microphone working?</div>')
                return
            } else {
                $("#status").text("")
            }
            console.log(`Time taken: ${performance.now() - start}ms`)
            console.log(results)
            var new_trace = {
                x: results.map(r => hzToBark(r["F2(Hz)"])),
                y: results.map(r => hzToBark(r["F1(Hz)"])),
                opacity: 1,
                mode: 'markers',
                marker: {
                    line: {
                        width: 0
                    }
                },
                type: 'scatter',
                hoverinfo: "none"
            };
            for (var i = 0; i < traces.length - 1; i++) {
                traces[i].opacity = Math.max(0, traces[i].opacity - .3)
            }
            traces.splice(traces.length - 1, 0, new_trace);
            console.log(traces, layout)
            Plotly.react('plot', traces, layout);

            var keys = Object.keys(results[0]).filter(k => k.startsWith("F"))
            var debug_traces = []
            for (var k of keys) {
                debug_traces.push({
                    x: results.map(r => r.time),
                    y: results.map(r => hzToBark(r[k])),
                    name: k.replace("(Hz)", "(Bark)")
                })
            }
            var debug_layout = {
                xaxis: {
                    title: "Time (s)"
                },
                yaxis: {
                    title: "Bark scale frequency"
                },
                hovermode: "x"
            }
            Plotly.newPlot('debug_plot', debug_traces, debug_layout)//, {staticPlot: true});
            debug_plot.on("plotly_hover", function (data) {
                console.log(data);
                var points = data.points
                var time = points[0].x
                var index = results.findIndex(r => r.time == time)
                new_trace.marker.line.width = new_trace.x.map((x, i) => i == index ? 2 : 0)
                Plotly.react('plot', traces, layout);
            })
        })
    })
    if (post && password && participant_id) {
        var form = new FormData();
        form.append("file", blob);
        try {
            await fetch(`https://api-proxy.auckland-cer.cloud.edu.au/MPAi_API/?password=${password}&participant_id=${participant_id}_${$("#vowel").val()}`, {
                method: "POST",
                body: form
            }).then(r => r.json()).then(r => {
                console.log(r)
                if (r.status == "success") {
                    $("#upload_status").html('<div class="alert alert-success" role="alert">Recording uploaded successfully</div>')
                } else {
                    $("#upload_status").html(`<div class="alert alert-danger" role="alert">Error uploading recording: ${r.detail}</div>`)
                }
            })
        } catch (e) {
            console.error(e)
            $("#upload_status").html('<div class="alert alert-danger" role="alert">Error uploading recording</div>')
        }
    }
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
        event.preventDefault()
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

$("#record").on("mousedown touchstart", function (e) {
    toggleRecording(this);
    return false
})

$("#record").on("mouseup touchend", function (e) {
    toggleRecording(this);
    return false
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

    // Initialise an array to recieve the frequency data
    var data = new Uint8Array(analyserNode.frequencyBinCount);

    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
    // Each item in the array represents the decibel value for a specific frequency. The frequencies are spread linearly from 0 to 1/2 of the sample rate. For example, for 48000 sample rate, the last item of the array will represent the decibel value for 24000 Hz.
    analyserNode.getByteFrequencyData(data);

    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    analyserContext.fillStyle = '#F6D565';
    analyserContext.lineCap = 'round';

    // Draw rectangle for each frequency bin.
    for (var x = 0; x < canvasWidth; x++) {
        var y = data[x];
        // In HSL space, 0=red 120=green 240=blue 360=red
        var hue = x * 360 / canvasWidth
        analyserContext.fillStyle = `hsl(${hue}, 100%, 50%)`;
        // x (upper left), y (upper left), width, height
        analyserContext.fillRect(x, canvasHeight, 1, -y);
    }

    /*
    analyserNode.getByteTimeDomainData(data);
    analyserContext.lineWidth = 2;
    analyserContext.strokeStyle = 'rgb(0, 0, 0)';
    analyserContext.beginPath();
    let sliceWidth = canvasWidth / analyserNode.frequencyBinCount;
    let x = 0;

    for (let i = 0; i < analyserNode.frequencyBinCount; i++) {
        let v = data[i] / 128.0;
        let y = v * canvasHeight / 2;
        if (i === 0) {
            analyserContext.moveTo(x, y);
        } else {
            analyserContext.lineTo(x, y);
        }
        x += sliceWidth;
    }

    analyserContext.lineTo(canvasWidth, canvasHeight / 2);
    analyserContext.stroke();
    */

    rafID = window.requestAnimationFrame(updateAnalysers);
}

// This is called after the user grants microphone permission, and the microphone is ready to use.
async function gotStream(stream) {
    audioContext = new AudioContext();
    audioInput = audioContext.createMediaStreamSource(stream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    audioInput.connect(analyserNode);
    audioRecorder = new Recorder(audioInput);
    updateAnalysers();
    var devices = await navigator.mediaDevices.enumerateDevices();
    if ($("#mic > option").length == 0) {
        for (var device of devices) {
            if (device.kind == "audioinput") {
                var selected = device.deviceId == "default" ? "selected": "";
                $("#mic").append(`<option value="${device.deviceId}" ${selected}>${device.label}</option>`)
            }
        }
    }
}

$("#mic").change(function () {
    console.log(this.value)
    navigator.mediaDevices.getUserMedia({ audio: {
        deviceId: {exact: this.value},
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true
    } }).then(gotStream, onError);
});

function onError(e) {
    alert('Error getting audio');
    console.log(e);
}

function initAudio() {
    // One-liner to resume playback when user interacted with the page.
    $(window).on('mousedown keydown touchstart', function () {
        if (audioContext.state == 'suspended')
            audioContext.resume().then(() => {
                console.log('Playback resumed successfully');
                //Shiny.setInputValue("recordingStarted", 0);
            });
    });

    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    const userMediaResult = navigator.mediaDevices.getUserMedia({ audio: {
        //numChannels: 1,
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true
    } });
    userMediaResult.then(gotStream);
    return userMediaResult
}

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
