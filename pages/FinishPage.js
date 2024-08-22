import TikiMessage from "../components/TikiMessage.js";

export default {
    components: { TikiMessage },
    template: `
        <TopBar @prev-click="prevClicked()" />
        <div class="flex-fill">
            <TikiMessage>
            Thank you for participating in this study.
            </TikiMessage>
            </div>
        </div>
    `
}
