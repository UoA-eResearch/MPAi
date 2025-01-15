import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import PlaygroundView from "../components/PlaygroundView.js";
import { config, resources } from '../store.js'
import AcknowledgementButton from "../components/AcknowledgementButton.js";
import SpeakerOptionDropdown from "../components/SpeakerOptionDropdown.js";


export default {
    components: { AcknowledgementButton, TopBar, TikiMessage, PlaygroundView, SpeakerOptionDropdown },
    template: `
    <TopBar :hideBackButton="true">
      <AcknowledgementButton />
      <SpeakerOptionDropdown :echoOption="false" />
    </TopBar>
    <TikiMessage>Experiment with making different sounds.</TikiMessage>
    <PlaygroundView :showEllipses="true" @vowel-click="handleVowelClicked" />
    `,
    data() {
        return {
            config,
            resources
        }
    },
    methods: {
        handleVowelClicked(vowel) {
            console.log("Vowel clicked", vowel);
            const sound = this.resources.sounds.find(sound => sound.vowel === vowel);
            const samples = this.config.modelSpeaker.samples[sound.name];
            if (!samples) {
                console.warn(`No samples found for sound ${this.sound} in currently selected model speaker.`);
                return;
            }
            // Randomly selected a sample to play back.
            const idx = Math.round(Math.random() * (samples.length - 1))
            const audio = new Audio(samples[idx]);
            audio.play();
        },
    }
};