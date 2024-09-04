import TikiMessage from "../components/TikiMessage.js";
import TopBar from "../components/TopBar.js";
import { config } from "../store.js";

export default {
    components: { TikiMessage, TopBar },
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
                Your recordings have been sent to us for analysis. Thank you for participating in this study. 
                </template>
                <template v-if="!config.studyParticipantId">
                Thank you for trying the Māori Pronunciation Aid tool.
                </template>
            </p>
            <div class="mt-3 d-flex flex-column gap-2 col-lg-6 justify-content-center mx-auto">
                <button class="btn btn-primary" @click="goHome()">Go Home</button>
            </div>
            </div>
        </div>
    `,
    methods: {
        goHome() {
            this.$router.replace({ name: "welcome" });
        }
    }
}
