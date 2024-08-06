import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import { config } from "../store.js";
import { startRecording, stopRecording, initialisePlots } from '../audio.js';

export default {
    data() {
        return {
            vowel: "a",
            sound: "ta",
            config,
            isRecording: false
        }
    },
    components: { TopBar, TikiMessage, BottomBar },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <div class="flex-fill">
    <TikiMessage>Try to pronounce <strong>{{sound}}</strong>.</TikiMessage>
    <div class="d-flex justify-content-center">
        <div id="plot" class="d-block w-75" ref="dotplot" style="width:100%; height: 600px;"></div>
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
    <BottomBar :isContinueEnabled="false" />
    `,
    methods: {
        prevClicked() {
            this.$router.replace({ name: "playground" });
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
        handleSpaceReleased(event) {
            if (event.code === 'Space' && this.isRecording) {
                this.isRecording = false;
                stopRecording();
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