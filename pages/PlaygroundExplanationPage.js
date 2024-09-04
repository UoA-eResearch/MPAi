import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";


export default {
    components: { TopBar, TikiMessage, BottomBar },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <TikiMessage>Ready to try the model?</TikiMessage>
    <div class="flex-grow-1">
    <p class="text-center">In the next page, you will be able to interact fully with the model we've created.  Experiment with making different sounds, and look at both views. What do you notice? </p>
    </div>
    <BottomBar @continue-click="nextClick()" :isContinueEnabled="true" />
    `,
    methods: {
        prevClicked() {
            this.$router.replace("/")
        },
        nextClick() {
            this.$router.push({ name: "playground" });
        }
    }
};