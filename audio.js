import "https://cdn.plot.ly/plotly-basic-2.35.1.min.js";
import "./forest.js";
import "./ksvF0.js";
import "./recorder.js";
// Extracted audio code from main.js.

window.AudioContext = window.AudioContext || window.webkitAudioContext;

/**
 * @typedef {Object} FormantScatterplot This defines a 
 * @property {string} element
 * @property {object[]} traces
 * @property {object} layout 
 */

var audioContext = null;//new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var analyserNode = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var speaker = "female";
var lastRecording;
var traces = [];
var layout = {};
var scatterplotElement;
var timelineElement;
const timelineLayout = {
    dragmode: false,
    xaxis: {
        title: "Time (s)",
        minallowed: 0
    },
    yaxis: {
        showgrid: false,
        title: "Bark scale frequency",
        range: [1, 24]
    },
    autosize: true,
    hovermode: "x",
    plot_bgcolor: '#faffee',
    margin: {
        l: 50,
        r: 50,
        b: 50,
        t: 20,
    },
}

export function hzToBark(freqHz) {
    var bark = 26.81 / (1 + (1960 / freqHz)) - 0.53 //#((26.81 * freqHz)/(1960 + freqHz)) - 0.53 #using Traunmüller1990
    return bark
}

export function initialiseTimeline(timelineEl) {
    timelineElement = timelineEl;
    Plotly.newPlot(timelineEl, [], timelineLayout, {
        displayModeBar: false,
        doubleClick: false,
        staticPlot: true,
        responsive: true
    });

}

export function setSpeakerGender(val) {
    speaker = val;
}

export function getLastRecording() {
    return new Audio(URL.createObjectURL(lastRecording));
}

export function initScatterplot(plotElement) {
    scatterplotElement = plotElement;
    // Remove traces to reset the plot.
    traces = [];

    layout = {
        plot_bgcolor: '#faffee',
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
            // showgrid: false,
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
            // showgrid: false,
            zeroline: false,
            //visible: false,
            range: [9, 2],
            //title: "F1 (Bark)",
            title: "Mouth Openness (F1)"
        },
        autosize: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 20,
        },
        showlegend: false
    }
    Plotly.newPlot(plotElement, null, layout, {
        displayModeBar: false,
        doubleClick: false,
        staticPlot: true,
        responsive: true
    })
}

export function updateAnnotations(plotElement, lang) {
    const annotations = [
        {
            xref: 'paper',
            yref: 'paper',
            x: 0,
            xanchor: 'right',
            y: 1,
            yanchor: 'bottom',
            text: lang === 'en' ? 'Closed' : 'Kati',
            showarrow: false
        },
        {
            xref: 'paper',
            yref: 'paper',
            x: 0,
            xanchor: 'right',
            y: 0,
            yanchor: 'bottom',
            text: lang === 'en' ? 'Open' : 'Tuwhera',
            showarrow: false
        },
        {
            xref: 'paper',
            yref: 'paper',
            x: 0,
            xanchor: 'left',
            y: 0,
            yanchor: 'top',
            text: lang === 'en' ? 'Front' : 'Mua',
            showarrow: false
        },
        {
            xref: 'paper',
            yref: 'paper',
            x: 1,
            xanchor: 'left',
            y: 0,
            yanchor: 'top',
            text: lang === 'en' ? 'Back' : 'Muri',
            showarrow: false
        }
    ];
    layout.annotations = annotations;
    layout.xaxis.title = lang === 'en' ? "Tongue Position (F2)" : "Takoto o te arero (F2)";
    layout.yaxis.title = lang === 'en' ? "Mouth Openness (F1)" : "Tuwhera o te waha (F1)";
    Plotly.relayout(plotElement, layout);

}

export function updateFormantEllipses(plotElement, formants, highlightedVowel) {
    const shapes = formants.flatMap(
        f => createFormantShape(f, highlightedVowel ? f.vowel == highlightedVowel : false)
    );
    traces = [{
        x: formants.map(r => hzToBark(r["F2_mean"])),
        y: formants.map(r => hzToBark(r["F1_mean"])),
        autocolorscale: true,
        text: formants.map(r => r.vowel),
        //textposition: 'top',
        textfont: {
            size: 20
        },
        mode: 'text',
        type: 'scatter',
        hoverinfo: "none"
    }];
    layout.shapes = shapes;

    Plotly.react(plotElement, traces, layout);

}

function createFormantShape(formant, isHighlighted) {
    const shapes = [];
    const step = .05;
    for (var i = 0; i <= 1; i += step) {
        shapes.push({
            type: "circle",
            xref: "x",
            yref: "y",
            x0: hzToBark(formant["F2_mean"] - formant["F2_sd"] * i),
            y0: hzToBark(formant["F1_mean"] - formant["F1_sd"] * i),
            x1: hzToBark(formant["F2_mean"] + formant["F2_sd"] * i),
            y1: hzToBark(formant["F1_mean"] + formant["F1_sd"] * i),
            opacity: step / 2,
            fillcolor: isHighlighted ? 'red' : 'lightgray',
            line: {
                width: 0
            }
        })
    }
    return shapes;
}


export function updateAnalysers(analyserElement) {
    // function updateAnalysers(analyserElement) {
    if (!analyserContext) {
        canvasWidth = analyserElement.width;
        canvasHeight = analyserElement.height;
        analyserContext = analyserElement.getContext('2d');
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

    rafID = window.requestAnimationFrame(updateAnalysers.bind(this, analyserElement));
}


async function gotStream(stream) {
    audioContext = new AudioContext();
    audioInput = audioContext.createMediaStreamSource(stream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    audioInput.connect(analyserNode);
    audioRecorder = new Recorder(audioInput);
    // updateAnalysers();
}

function onError(e) {
    // alert('Error getting audio');
    console.log(e);
}

export function updateInputSource(inputId) {
    // function updateInputSource(inputId) {
    navigator.mediaDevices.getUserMedia({
        audio: {
            deviceId: { exact: inputId },
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true
        }
    }).then(gotStream, onError);

}

/**
 * 
 * @returns {Promise<MediaStream>} A Promise of media stream
 */
export function initAudio() {
    // function initAudio() {
    // One-liner to resume playback when user interacted with the page.
    function resumePlayback() {
        if (audioContext.state == 'suspended')
            audioContext.resume().then(() => {
                console.log('Playback resumed successfully');
            });
    }

    window.addEventListener('mousedown', resumePlayback);
    window.addEventListener('keydown', resumePlayback);
    window.addEventListener('touchstart', resumePlayback);

    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    const userMediaResult = navigator.mediaDevices.getUserMedia({
        audio: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true
        }
    });
    userMediaResult.then(gotStream, onError);
    return userMediaResult;
}

export function startRecording() {
    // function startRecording() {
    audioRecorder.clear();
    audioRecorder.record();
}

// Cache WASM
window.ksvF0({ arguments: ["-X"] })
window.forest({ arguments: ["-X"] })


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

async function doneEncoding(blob, post = true) {
    // $("#compare").prop('disabled', false);
    if (post) lastRecording = blob;

    //var audioUrl = URL.createObjectURL(blob);
    //audioRecorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    console.log(blob)
    var content = await blob.arrayBuffer()
    content = new Uint8Array(content)
    var start = performance.now()

    const ksvFModule = await window.ksvF0({noInitialRun: true});

    // return window.ksvF0({ noInitialRun: true }).then(async function (Module) {
    ksvFModule.FS.writeFile("1.wav", content)
    var ksvFArgs = [
        "1.wav", // input file
        "-oA", // output in XASSP ASCII format
    ]
    if (speaker == "female") {
        ksvFArgs.push("-g=f")
    } else {
        ksvFArgs.push("-g=m")
    }
    ksvFModule.callMain(ksvFArgs)
    var pitch_results = parse_F0(ksvFModule.FS.readFile("1.f0", { encoding: "utf8" }));
    const forestModule = await window.forest({ noInitialRun: true });

// return window.forest({ noInitialRun: true }).then(async function (Module) {
    forestModule.FS.writeFile("1.wav", content)
    var forestArgs = [
        "1.wav", // input file
        "-oA", // output in plain ASCII format
        //"-L=49", // set effective length of analysis window to <dur> ms (default: 20.0)
        "-n=2", // set number of output formants to <num> (default: 4;  maximum: 8 or half the LP order)
        //"-p=-0.95", // set pre-emphasis factor to <val> (-1 <= val <= 0) (default: dependent on sample rate and nominal F1)
        //"-s=10", // set analysis window shift to <dur> ms (default: 5.0)
        //"-t=70" //  set silence threshold (no analysis) to <num> dB (default: 0.0 dB)
    ]
    if (speaker === "female") {
        forestArgs.push("-f")
    }
    forestModule.callMain(forestArgs)
    var results = parse_FMS(forestModule.FS.readFile("1.fms", { encoding: "utf8" }))
    console.log(results)
    for (var i = 0; i < results.length; i++) {
        results[i]["F0(Hz)"] = pitch_results[i]["F0(Hz)"]
    }
    results = results.filter(r => r["F0(Hz)"] > 0 && r["F1(Hz)"] > 0 && r["F2(Hz)"] > 0)
    if (results.length === 0) {
        console.warn("No formants detected")
        throw new Error("No formants detected");
        // $("#status").html('<div class="alert alert-danger" role="alert">No formants detected - is your microphone working?</div>')
        // } else {
        //     $("#status").text("")
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
    Plotly.react(scatterplotElement, traces, layout);

    var keys = Object.keys(results[0]).filter(k => k.startsWith("F"))
    var debug_traces = []
    for (var k of keys) {
        debug_traces.push({
            x: results.map(r => r.time),
            y: results.map(r => hzToBark(r[k])),
            name: k.replace("(Hz)", "(Bark)")
        })
    }
    if (timelineElement) {
        Plotly.react(timelineElement, debug_traces, timelineLayout);//, {staticPlot: true});
        timelineElement.addEventListener("plotly_hover", function (data) {
            console.log(data);
            var points = data.points
            var time = points[0].x
            var index = results.findIndex(r => r.time == time)
            new_trace.marker.line.width = new_trace.x.map((x, i) => i == index ? 2 : 0)
            Plotly.react(scatterplotElement, traces, layout);
        });
    }
        // })
    // })
}


function gotBuffers(buffers) {
    console.log(buffers)
    // var canvas = document.getElementById("wavedisplay");
    var sampleRate = audioContext.sampleRate

    // drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

    // the ONLY time gotBuffers is called is right after a new recording is completed -
    // so here's where we should set up the download.
    //audioRecorder.exportWAV(doneEncoding);
    return new Promise(function (resolve, reject) {
        audioRecorder.exportMonoWAV(function (blob) {
            resolve(doneEncoding(blob).then(() => blob));
        });
    });
}

export async function stopRecording() {
    const sampleRate = audioContext.sampleRate;
    audioRecorder.stop();
    const buffers = await new Promise(function (resolve, reject) {
        audioRecorder.getBuffers(resolve);
    });
    return await gotBuffers(buffers);
}

export async function uploadAudioBlob(participant_id, password, vowel, blob) {
    if (blob && password && participant_id && vowel) {
        var form = new FormData();
        form.append("file", blob);
        return fetch(`https://api-proxy.auckland-cer.cloud.edu.au/MPAi_API/?password=${password}&participant_id=${participant_id}_${vowel}`, {
            method: "POST",
            body: form
        }).then(r => r.json()).then(r => {
            console.log(r);
            return r;
            // if (r.status == "success") {
            //     $("#upload_status").html('<div class="alert alert-success" role="alert">Recording uploaded successfully</div>')
            // } else {
            //     $("#upload_status").html(`<div class="alert alert-danger" role="alert">Error uploading recording: ${r.detail}</div>`)
            // }
        });
        // } catch (e) {
        //     console.error(e)
        //     $("#upload_status").html('<div class="alert alert-danger" role="alert">Error uploading recording</div>')
        // }
    }
}

// export function getMicPermission() {
//     return initAudio().then(() => {
//         navigator.mediaDevices.enumerateDevices().then((devices) => {
//             // Save a list of input devices to display.
//             return devices.filter(device => device.kind === "audioinput");
//             // Sets default device to be the initial selected device.
//             const defaultDevice = inputDevices.find(device => device.deviceId === "default")
//             return defaultDevice ? "default" : this.inputDevices[0].deviceId;
//         }, () => { console.log("Failed to enumerate devices.") });
//     });
// }