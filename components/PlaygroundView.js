import {
    hzToBark,
    initialiseTimeline,
    initScatterplot,
    startRecording,
    stopRecording,
    updateAnnotations,
    updateFormantEllipses
} from "../audio.js";
import { config, resources, appState } from '../store.js'


export default {
    props: ['sound', 'showEllipses'],
    data() {
        return {
            config,
            appState,
            resources,
            graphDisplayed: "dotplot",
            isRecording: false,
            isTimelineInitialised: false,
            recordTooltip: null,
            toolTipTimeoutId: null
        }
    },
    computed: {
        speakerFormants() {
            const allFormants = this.resources.speakerFormants;
            const gender = this.config.modelSpeaker.gender;
            return allFormants.filter(r => r.length === "long" && r.speaker === gender);
        }
    },
    template: `
    <ul class="nav nav-pills nav-fill d-lg-none mb-3">
        <li class="nav-item">
            <a @click.prevent="changeDisplayedGraph('dotplot')" 
            class="nav-link"
            :class="{'active': graphDisplayed === 'dotplot'}"
            :aria-current="graphDisplayed === 'dotplot'"
            href="">
            Dot Plot
            </a>
        </li>
        <li class="nav-item">
        <a @click.prevent="changeDisplayedGraph('timeline')" 
            :class="{'active': graphDisplayed === 'timeline'}"
            :aria-current="graphDisplayed === 'timeline'"
            class="nav-link"
            href=""
        >Timeline</a>
        </li>
    </ul>
    <div class="d-lg-flex flex-column flex-grow-1">
        <div id="playground-dotplot" @click="handleDotplotClicked" class="d-lg-block js-plotly-plot" :class="{'d-none': graphDisplayed === 'timeline'}" ref="dotplot"></div>
        <div id="playground-timeline" class="d-lg-block js-plotly-plot" :class="{'d-none': graphDisplayed === 'dotplot'}" ref="timeline"></div>
    </div>
    <div class="text-center my-3">
        <div class="d-inline-block"
                   ref="recordTooltip"
                   data-bs-offset="0,15"
                   data-bs-trigger="manual"
                   data-bs-container="body"
                   data-bs-toggle="tooltip"
                   data-bs-placement="top"
                   data-bs-title="Testing"
        >
            <button 
                id="record"
                @mousedown.prevent="handleRecordPressed"
                @touchstart.prevent="handleRecordPressed"
                @mouseup.prevent="handleRecordReleased"
                @touchend.prevent="handleRecordReleased"
                :class="{recording: isRecording}"
                class="btn btn-primary"><i class="bi bi-mic"></i>Record</button>
        </div>
    </div>
    `,
    watch: {
        "sound": function () {
            // When sound has changed, reinitialise plots to erase previous traces.
            this.initialisePlots();
            // Remove any tooltips currently being displayed.
            this.clearTooltip();
        },
        "config.modelSpeaker": function () {
            // Reinitialise the graph to show new formant.
            this.initialisePlots();
        }
    },
    methods: {
        handleRecordPressed() {
            console.log("Record button pressed");
            this.clearTooltip();
            if (!this.isRecording) {
                this.isRecording = true;
                startRecording();
                console.log("Recording started");
            }
        },
        async handleRecordReleased() {
            console.log("Record button released");
            if (this.isRecording) {
                this.isRecording = false;
                try {
                    console.log("Recording stopped");
                    const audioBlob = await stopRecording();
                    this.$emit('new-record', audioBlob);
                    this.showKeyboardHintIfNeeded();

                } catch (err) {
                    this.showNoSoundError();
                }
            }
        },
        handleSpacePressed(event) {
            if (event.code === 'Space' && !this.isRecording) {
                this.clearTooltip();
                this.isRecording = true;
                // Disable showing keyboard hint
                this.appState.hasShownKeyboardHint = true;
                startRecording();
            }
        },
        handleDotplotClicked(event) {
            // If formant ellipses are showing, figure out which the user
            // clicked the closest to, and send an event.
            if (!this.showEllipses) {
                // If ellipses are not shown, then do not respond to clicks on the dotplot chart.
                return;
            }
            const bb = event.target.getBoundingClientRect();
            const elem = this.$refs.dotplot;
            const l = elem._fullLayout.margin.l;
            const t = elem._fullLayout.margin.t;
            const x = elem._fullLayout.xaxis.p2d(event.clientX - bb.left - l);
            const y = elem._fullLayout.yaxis.p2d(event.clientY - bb.top - t);
            const formantXs = this.speakerFormants.map(f => hzToBark(f["F2_mean"]));
            const formantYs = this.speakerFormants.map(f => hzToBark(f["F1_mean"]));

            let minIdx = 0;
            let minDist = Infinity;
            for (let i = 0; i < formantXs.length; i++) {
                let dist = Math.sqrt((formantXs[i] - x) ** 2 + (formantYs[i] - y) ** 2)
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = i;
                }
            }
            const vowel = this.speakerFormants[minIdx].vowel;
            this.$emit("vowel-click", vowel);
        },
        clearTooltip() {
            // Hide and destroy the tooltip.
            const tooltip = bootstrap.Tooltip.getOrCreateInstance(this.$refs.recordTooltip);
            tooltip.dispose();
            clearTimeout(this.toolTipTimeoutId);
        },
        showNoSoundError() {
            const tooltip = bootstrap.Tooltip.getOrCreateInstance(this.$refs.recordTooltip);
            tooltip.setContent({
                ".tooltip-inner":"Couldn't hear you. Check your microphone?"
            });
            tooltip.show();
            // Hide the tooltip 5 seconds later and stop hint from showing next time.
            this.toolTipTimeoutId = setTimeout(() => {
                console.log("Hiding tooltip");
                tooltip.hide();
            }, 5000);
        },
        showTooShortError() {

        },
        showKeyboardHintIfNeeded() {
            // Shows hint for Space bar if it's not been shown before and we are on a desktop computer.
            if (!this.appState.hasShownKeyboardHint && !window.isMobileOrTablet()) {
                const tooltip = bootstrap.Tooltip.getOrCreateInstance(this.$refs.recordTooltip);
                tooltip.setContent({
                    ".tooltip-inner":"Ka pai! You can also press and hold Space bar to record."
                });
                tooltip.show();
                // Hide the tooltip 5 seconds later and stop hint from showing next time.
                setTimeout(() => {
                    tooltip.hide();
                    this.appState.hasShownKeyboardHint = true;
                }, 5000);
            }
        },
        async handleSpaceReleased(event) {
            if (event.code === 'Space' && this.isRecording) {
                this.isRecording = false;
                try {
                    const audioBlob = await stopRecording();
                    this.$emit('new-record', audioBlob);
                } catch (err) {
                    this.showNoSoundError();
                }
            }
        },

        changeDisplayedGraph(graphName) {
            this.graphDisplayed = graphName;
            // Trigger plotly's responsive handler to resize graphs to fit.
            this.$nextTick(function () {
                // Initialise timeline
                if (graphName === "timeline" && !this.isTimelineInitialised) {
                    initialiseTimeline(this.$refs.timeline);
                    this.isTimelineInitialised = true;
                }
                window.dispatchEvent(new Event('resize'));
            });
        },
        initialisePlots() {
            initScatterplot(this.$refs.dotplot);
            if (this.showEllipses) {
                updateFormantEllipses(this.$refs.dotplot, this.speakerFormants, this.vowel);
            }
            updateAnnotations(this.$refs.dotplot, this.config.language);
            // When initialising a plotly graph set to autosize, if the graph is not visible, it will be set to 450px.
            // On mobile view, timeline is hidden by default so it will be set to 450px, and thus larger than viewport. 
            // This bit of logic checks if the timeline is visible (i.e. on a larger screen). If it is, initialise it. Otherwise,
            // wait until it is visible to initialise it.
            const isTimelineVisible = window.getComputedStyle(this.$refs.timeline).getPropertyValue('display') !== "none";
            if (isTimelineVisible) {
                initialiseTimeline(this.$refs.timeline);
                this.isTimelineInitialised = true;
            }
        }
    },
    mounted() {
        this.initialisePlots();
        new bootstrap.Tooltip(this.$refs.recordTooltip);
        window.addEventListener('keydown', this.handleSpacePressed);
        window.addEventListener('keyup', this.handleSpaceReleased);
    },
    beforeUnmount() {
        // Clean up any tooltips currently showing.
        this.clearTooltip();
        window.removeEventListener('keydown', this.handleSpacePressed);
        window.removeEventListener('keyup', this.handleSpaceReleased);
    }
};