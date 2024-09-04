import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import { config, resources } from "../store.js";
import { startRecording, stopRecording, initScatterplot, uploadAudioBlob, updateFormantEllipses, updateAnnotations, getLastRecording, setSpeakerGender } from '../audio.js';


export default {
    props: ['vowel', 'sound', 'nextUrl'],
    data() {
        return {
            config,
            resources,
            isRecording: false,
            attemptsRemaining: 5
        }
    },
    computed: {
        canContinue() {
            return this.attemptsRemaining <= 0;
        }
    },
    components: { TopBar, TikiMessage, BottomBar },
    template: `
    <TopBar @prev-click="prevClicked()" :speakerOptionEnabled="true" />
    <TikiMessage>Try pronouncing <a href="#" @click.prevent="playSample();" style="display:inline-block; text-decoration: underline dotted; font-weight:bold;">{{sound}} <i class="bi bi-play"></i></a>.</TikiMessage>
    <div class="d-flex justify-content-center flex-grow-1">
        <div class="d-block" ref="dotplot" style="width:100%; height: 100%;"></div>
    </div>
    <div class="text-center my-3">
        <button 
            v-if="!canContinue"
            id="record"
            @mousedown="handleRecordPressed"
            @touchstart="handleRecordPressed"
            @mouseup="handleRecordReleased"
            @touchend="handleRecordReleased"
            :class="{recording: isRecording}"
            class="btn btn-primary"><i class="bi bi-mic"></i>Record</button>
    </div>
    <p v-if="!canContinue" class="text-center">
        Try pronouncing it {{attemptsRemaining}} {{attemptsRemaining !== config.attemptsAllowed ? "more" : ""}} {{attemptsRemaining > 1 ? "times" : "time"}}. 
    </p>
    <BottomBar :isContinueEnabled="canContinue" @continue-click="nextClicked()" />
    `,
    watch: {
        "config.modelSpeaker": function () {
            // Play sound sample if user changes model speaker to demonstrate what it sounds like.
            this.playSample();
            // Reinitialise the graph to show different formant.
            this.initialiseGraph();
        }
    },
    methods: {
        prevClicked() {
            this.$router.replace({ name: "playground" });
        },
        nextClicked() {
            this.$router.replace(this.nextUrl);
        },
        handleRecordPressed() {
            console.log("Record button pressed");
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
                const blob = await stopRecording();
                this.uploadAudio(blob);
                console.log("Recording stopped");
            }
        },
        handleSpacePressed(event) {
            if (event.code === 'Space' && !this.isRecording) {
                this.isRecording = true;
                startRecording();
            }
        },
        async handleSpaceReleased(event) {
            if (event.code === 'Space') {
                await this.handleRecordReleased();
            }
        },
        playSample() {
            const samples = this.config.modelSpeaker.samples[this.sound];
            if (!samples) {
                console.warn(`No samples found for sound ${this.sound} in currently selected model speaker.`);
                return;
            }
            // Randomly selecte a sample to play back.
            const idx = Math.round(Math.random() * (samples.length - 1))
            const audio = new Audio(samples[idx]);
            audio.play();
        },
        echo() {
            const lastRecording = getLastRecording();
            lastRecording.addEventListener("ended", () => {
                setTimeout(this.playSample, 500);
            });
            lastRecording.play();
        },
        async uploadAudio(blob) {
            const participantId = this.config.studyParticipantId;
            const password = this.config.studyParticipantPassword;
            try {
                await uploadAudioBlob(participantId, password, this.sound, blob);
                this.attemptsRemaining--;
            } catch (e) {
                console.error("Could not upload to audio server.");
                console.error(e);
            }
            if (this.config.echo) {
                setTimeout(this.echo, 500);
            }
        },
        initialiseGraph() {
            const allFormants = this.resources.speakerFormants;
            const gender = this.config.modelSpeaker.gender;
            const formants = allFormants.filter(r => r.length == "long" && r.speaker == gender);
            initScatterplot(this.$refs.dotplot);
            updateFormantEllipses(this.$refs.dotplot, formants, this.vowel);
            updateAnnotations(this.$refs.dotplot, this.config.language);
            setSpeakerGender(gender);
        }
    },
    mounted() {
        // Initiatlise attempts with configured attempts.
        this.attemptsRemaining = this.config.attemptsAllowed;
        this.initialiseGraph();
        window.addEventListener('keydown', this.handleSpacePressed);
        window.addEventListener('keyup', this.handleSpaceReleased);
        // Play the sample on page load.
        this.playSample();
    },
    unmounted() {
        window.removeEventListener('keydown', this.handleSpacePressed);
        window.removeEventListener('keyup', this.handleSpaceReleased);
    }
}