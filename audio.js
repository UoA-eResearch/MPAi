// Extracted audio code from main.js.

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

export function initPlot(plotElement) {
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
            const shapes = []
            for (var r of results) {
                var step = .05;
                for (var i = 0; i <= 1; i += step) {
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
            Plotly.newPlot(plotElement, traces, layout, {
               displayModeBar: false,
               doubleClick: false,
               staticPlot: true,
               responsive: true
            })
        }
    });
}

