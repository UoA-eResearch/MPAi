import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import {config} from "../store.js";

export default {
    components: { TopBar, TikiMessage, BottomBar },
    data: function () {
        return {
            config
        }
    },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <TikiMessage>You sound great! It's time to record and compare your pronunciation</TikiMessage>
    <div class="flex-grow-1">
    <p class="text-center">In the next few pages, you will choose and hear from a kaumatua or a kuia pronouncing vowels.  Try to voice and record the vowels, and match the way they pronounce the vowels. </p>
    <p v-if="config.studyParticipantId">As part of the study, your recordings will be sent to our server for analysis.</p>
    </div>
    <BottomBar @continue-click="nextClick()" :isContinueEnabled="true" />
    `,
    methods: {
        prevClicked() {
            this.$router.replace("/")
        },
        nextClick() {
            this.$router.push({ name: "model-speaker" });
        }
    }
};