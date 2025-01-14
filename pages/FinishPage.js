import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import TopBar from "../components/TopBar.js";
import { config } from "../store.js";

export default {
    components: { TikiMessage, TopBar, BottomBar },
    data: function () {
        return {
            config
        }
    },
    template: `
        <div style="padding-top:3rem;" class="flex-fill">
            <TikiMessage>
            Thank you!
            </TikiMessage>
            <p class="text-center">
                <template v-if="config.studyParticipantId">
                    Your recordings have been sent to us for analysis. Thank you for participating in this study. In the next page, you can continue to experiment with the model with the full set of features.
                </template>
                <template v-if="!config.studyParticipantId">
                    Thank you for trying Māori Pronunciation Aid. In the next page, you can continue to experiment with the model with the full set of features.
                </template>
            </p>
        </div>
        <BottomBar :isContinueEnabled="true" @continue-click="nextClicked()" />
    `,
    methods: {
        nextClicked() {
            this.$router.replace({ name: "full-playground" });
        }
    }
}
