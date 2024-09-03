import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import { initialiseTimeline, initScatterplot, startRecording, stopRecording, updateAnnotations, uploadAudioBlob } from "../audio.js";
import { config, resources } from '../store.js'


export default {
    data() {
        return {
            config,
            resources,
            graphDisplayed: "dotplot",
            isRecording: false
        }
    },
    components: { TopBar, TikiMessage, BottomBar },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <div class="flex-fill">
    <TikiMessage>Try record yourself pronouncing a vowel.</TikiMessage>
    <p class="text-center">Experiment with different vowels, and look at both views. What do you notice? When you're done, tap Continue.</p>
    <ul class="nav nav-pills nav-fill d-lg-none">
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
    <div class="d-lg-flex flex-column">
        <div id="plot" class="d-lg-block js-plotly-plot" :class="{'d-none': graphDisplayed === 'timeline'}" ref="dotplot"></div>
        <div id="debug_plot" class="d-lg-block js-plotly-plot" :class="{'d-none': graphDisplayed === 'dotplot'}" ref="timeline"></div>
    </div>
    <div class="text-center">
        <button 
            id="record"
            @mousedown="handleRecordPressed"
            @touchstart="handleRecordPressed"
            @mouseup="handleRecordReleased"
            @touchend="handleRecordReleased"
            :class="{recording: isRecording}"
            class="btn btn-primary"><i class="bi bi-mic"></i>Record</button>
    </div>
    </div>
    <BottomBar @continue-click="nextClick()" :isContinueEnabled="true" />
    `,
    methods: {
        prevClicked() {
            this.$router.replace("/")
        },
        nextClick() {
            this.$router.push({ name: "model-speaker" });
        },
        handleRecordPressed() {
            if (!this.isRecording) {
                this.isRecording = true;
                startRecording();
            }
        },
        handleRecordReleased() {
            if (this.isRecording) {
                this.isRecording = false;
                stopRecording();
            }
        },
        handleSpacePressed(event) {
            if (event.code === 'Space' && !this.isRecording) {
                this.isRecording = true;
                startRecording();
            }
        },
        async handleSpaceReleased(event) {
            if (event.code === 'Space' && this.isRecording) {
                this.isRecording = false;
                stopRecording();
            }
        },

        changeDisplayedGraph(graphName) {
            this.graphDisplayed = graphName;
            // Trigger plotly's responsive handler to resize graphs to fit.
            this.$nextTick(function () {
                window.dispatchEvent(new Event('resize'));
            });
        }
    },
    mounted() {
        const allFormants = this.resources.speakerFormants;
        const gender = this.config.modelSpeaker.gender;
        const formants = allFormants.filter(r => r.length == "long" && r.speaker == gender);
        initScatterplot(this.$refs.dotplot);
        // updateFormantEllipses(this.$refs.dotplot, formants, this.vowel);
        updateAnnotations(this.$refs.dotplot, this.config.language);
        initialiseTimeline(this.$refs.timeline);
        window.addEventListener('keydown', this.handleSpacePressed);
        window.addEventListener('keyup', this.handleSpaceReleased);
    },
    unmounted() {
        window.removeEventListener('keydown', this.handleSpacePressed);
        window.removeEventListener('keyup', this.handleSpaceReleased);
    }
};