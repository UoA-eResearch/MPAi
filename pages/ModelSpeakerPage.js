import TopBar from "../components/TopBar.js";
import BottomBar from "../components/BottomBar.js";
import TikiMessage from "../components/TikiMessage.js";
import { config, resources } from "../store.js";

export default {
    components: { TopBar, BottomBar, TikiMessage },
    data() {
        return {
            config,
            resources
        };
    },
    template: `
        <TopBar @prev-click="prevClicked()" />
        <div class="flex-fill">
        <TikiMessage>
            Which kaumatua or kuia would you like to follow?
        </TikiMessage>
        <p class="text-center">Choose the speaker that is closest to your voice.</p>
        <ul class="list-group">
            <li class="list-group-item" v-for="speaker in resources.modelSpeakerOptions">
                <input class="form-check-input me-1" type="radio" @change="speakerChanged(speaker.name)" :checked="speaker.name == config.modelSpeaker.name" :value="speaker.name" :id="'speaker-' + speaker.name">
                <label class="form-check-label stretched-link" :for="'speaker-' + speaker.name">{{speaker.displayName}}</label>
            </li>
        </ul>
        </div>
        <BottomBar :isContinueEnabled="!!config.modelSpeaker" @continue-click="nextClicked()" />
    `,
    methods: {
        speakerChanged(name) {
            const speakers = this.resources.modelSpeakerOptions;
            this.config.modelSpeaker = speakers.find(speaker => speaker.name === name);
        },
        nextClicked() {
            this.$router.replace({ name: "taa-record" });
        },
        prevClicked() {
            this.$router.back();
        }
    }
}