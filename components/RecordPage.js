import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import { config } from "../store.js";
import { startRecording, stopRecording, initialisePlots, uploadAudioBlob } from '../audio.js';


export default {
    props: ['vowel', 'sound', 'nextUrl'],
    data() {
        return {
            config,
            isRecording: false,
            attemptsRemaining: 1
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
    <div class="flex-fill">
    <TikiMessage>Try pronouncing <a href="#" @click.prevent="playSample();" style="display:inline-block; text-decoration: underline dotted; font-weight:bold;">{{sound}} <i class="bi bi-play"></i></a>.</TikiMessage>
    <div class="d-flex justify-content-center">
        <div id="plot" class="d-block w-75" ref="dotplot" style="width:100%; height: 500px;"></div>
    </div>
    <div class="text-center">
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

    </div>
    <BottomBar :isContinueEnabled="canContinue" @continue-click="nextClicked()" />
    `,
    watch: {
        "config.modelSpeaker": function () {
            // Play sound sample if user changes model speaker to demonstrate what it sounds like.
            this.playSample();
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
            if (!this.isRecording) {
                this.isRecording = true;
                startRecording();
            }
        },
        async handleRecordReleased() {
            if (this.isRecording) {
                this.isRecording = false;
                const blob = await stopRecording();
                this.uploadAudio(blob);
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
        }
    },
    mounted() {
        initialisePlots(this.$refs.dotplot, null);
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