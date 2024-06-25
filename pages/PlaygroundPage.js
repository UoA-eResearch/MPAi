import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";

export default {
    components: {TopBar, TikiMessage},    
    template: `
    <TopBar @prev-click="prevClicked()" />
    <div class="flex-fill">
    <TikiMessage>Try playing with model. What do you notice?</TikiMessage>
    </div>
    `,
    methods: {
        prevClicked() {
            window.location.hash = "/"
        }
    }
};