import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import PlaygroundView from "../components/PlaygroundView.js";
import BottomBar from "../components/BottomBar.js";
import { initialiseTimeline, initScatterplot, startRecording, stopRecording, updateAnnotations, uploadAudioBlob } from "../audio.js";
import { config, resources } from '../store.js'


export default {
    data() {
        return {
            config,
            resources,
            isRecording: false,
        }
    },
    computed: {
        currentSoundIdx() {
            if (!this.$route.params.vowel) {
                return null;
            }
            return this.resources.sounds.findIndex(
                sound => sound.vowel === this.$route.params.vowel
            );
        },
        currentSound() {
            return isNaN(this.currentSoundIdx) ? null : this.resources.sounds[this.currentSoundIdx];
        }

    },
    components: { TopBar, TikiMessage, BottomBar, PlaygroundView },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <TikiMessage>Try to pronounce {{ currentSound.name }}.</TikiMessage>
    <PlaygroundView :sound="currentSound ? currentSound.name : null" />
    <BottomBar @continue-click="nextClick()" :isContinueEnabled="true" />
    `,
    methods: {
        prevClicked() {
            if (this.currentSoundIdx > 0) {
                // If we have advanced through vowels, go through previous vowels first.
                const sound = this.resources.sounds[this.currentSoundIdx - 1];
                this.$router.replace({ name: 'playground-vowel', params: { vowel: sound.vowel } });
            } else {
                this.$router.replace("/playground-explanation")
            }
        },
        nextClick() {
            if (this.currentSoundIdx < (this.resources.sounds.length - 1)) {
                const sound = this.resources.sounds[this.currentSoundIdx + 1];
                this.$router.push({ name: 'playground-vowel', params: { vowel: sound.vowel } });
            } else {
                this.$router.push({ name: "model-speaker" });
            }
        },
    }
};