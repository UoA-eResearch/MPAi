import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";

export default {
    components: { TopBar, TikiMessage, BottomBar },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <TikiMessage>You sound great! It's time to record and compare your pronunciation</TikiMessage>
    <div class="flex-grow-1">
    <p class="text-center">In the next few pages, you will choose and hear from a kaumatua or a kuia pronouncing vowels.  Try to voice and record the vowels, and match the way they pronounce the vowels. </p>
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