import { initialiseTimeline, initScatterplot, startRecording, stopRecording, updateAnnotations } from "../audio.js";
import { config, resources, appState } from '../store.js'


export default {
    props: ['sound'],
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
        <div id="playground-dotplot" class="d-lg-block js-plotly-plot" :class="{'d-none': graphDisplayed === 'timeline'}" ref="dotplot"></div>
        <div id="playground-timeline" class="d-lg-block js-plotly-plot" :class="{'d-none': graphDisplayed === 'dotplot'}" ref="timeline"></div>
    </div>
    <div class="text-center my-3">
        <div class="d-inline-block"
                   ref="recordTooltip"
                   data-bs-offset="0,15"
                   data-bs-trigger="manual"
                   data-bs-container="body"
                   data-bs-toggle="popover"
                   data-bs-placement="top"
                   data-bs-html="true"
                   data-bs-content="Testing"
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
                    await stopRecording();
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
        clearTooltip() {
            // Hide and destroy the tooltip.
            const tooltip = bootstrap.Popover.getOrCreateInstance(this.$refs.recordTooltip);
            tooltip.dispose();
            clearTimeout(this.toolTipTimeoutId);
        },
        showNoSoundError() {
            const tooltip = bootstrap.Popover.getOrCreateInstance(this.$refs.recordTooltip);
            tooltip.setContent({
                ".popover-body":"<p>Couldn't hear you. Check your microphone?</p>"
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
        handleFailedRecording() {

        },
        showKeyboardHintIfNeeded() {
            // Shows hint for Space bar if it's not been shown before and we are on a desktop computer.
            if (!this.appState.hasShownKeyboardHint && !window.isMobileOrTablet()) {
                const tooltip = bootstrap.Popover.getOrCreateInstance(this.$refs.recordTooltip);
                tooltip.setContent({
                    ".popover-body":"<p>Ka pai! You can also press and hold Space bar to record.</p>"
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
                    await stopRecording();
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
            const allFormants = this.resources.speakerFormants;
            const gender = this.config.modelSpeaker.gender;
            const formants = allFormants.filter(r => r.length == "long" && r.speaker == gender);
            initScatterplot(this.$refs.dotplot);
            // updateFormantEllipses(this.$refs.dotplot, formants, this.vowel);
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
        new bootstrap.Popover(this.$refs.recordTooltip);
        window.addEventListener('keydown', this.handleSpacePressed);
        window.addEventListener('keyup', this.handleSpaceReleased);
    },
    unmounted() {
        window.removeEventListener('keydown', this.handleSpacePressed);
        window.removeEventListener('keyup', this.handleSpaceReleased);
    }
};