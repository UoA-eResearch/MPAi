// singlepage.js contains code for initialising the single-page model.
initPlot('plot');
$("#plot").mousemove(handlePlotMousemove);
$("#plot").click(handlePlotClicked);
$("#speaker").change(handleSpeakerChanged);
$("#vowel").change(() => handleVowelChanged($("#vowel").val(), $("speaker").val()));
$("#play").click(() => handlePlayClicked($("#vowel").val(), $("speaker").val()));
$("#erase").click(function () {
    initPlot()
});
$("#compare").click(() => handleCompareClicked($("#vowel").val(), $("speaker").val()));
setupSpacePressedHandler(document.getElementById('record'));
$("#mic").change(handleMicChanged);
$("#record").on("mousedown touchstart", function (e) {
    toggleRecording(this);
    return false
})

$("#record").on("mouseup touchend", function (e) {
    toggleRecording(this);
    return false
})