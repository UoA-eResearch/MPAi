import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import { config } from "../store.js";
import { startRecording, stopRecording, initialisePlots, uploadAudioBlob } from '../audio.js';


export default {
    props: ['vowel', 'sound', 'sampleFile', 'nextUrl'],
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
    <TopBar @prev-click="prevClicked()" />
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
        handleRecordReleased() {
            if (this.isRecording) {
                this.isRecording = false;
                stopRecording();
                this.canContinue = true;
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
                const blob = await stopRecording();
                this.uploadAudio(blob);
            }
        },
        playSample() {
            const audio = new Audio("samples/" + this.sampleFile);
            audio.play();
        },
        async uploadAudio(blob) {
            const participantId = this.config.studyParticipantId;
            const password = this.config.studyParticipantPassword;
            try {
                await uploadAudioBlob(participantId, password, this.vowel, blob);
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
    },
    unmounted() {
        window.removeEventListener('keydown', this.handleSpacePressed);
        window.removeEventListener('keyup', this.handleSpaceReleased);
    }
}