import TopBar from "../components/TopBar.js";
import BottomBar from "../components/BottomBar.js";
import TikiMessage from "../components/TikiMessage.js";

export default {
    components: {TopBar, BottomBar, TikiMessage},    
    template: `
        <TopBar @prev-click="prevClicked()" />
        <div class="flex-fill">
        <TikiMessage>Please grant microphone permission, so I can hear you!</TikiMessage>
        <p class="text-center">Your microphone is used to listen to your pronunciation so analysis and comparison can happen. Your voice is processed on your device and no data is collected. If you are participating in one of our research studies, you can choose to record and send audio samples.</p>
        <div class="mt-5 d-grid gap-2 col-6 justify-content-center mx-auto">
        <a class="btn btn-secondary" @click="getMicPermission()" :class="{'d-none': hasGrantedPermission}">Grant microphone permission</a>
        <div id="viz_container" :class="{'d-none': !hasGrantedPermission}">
        <div id="viz">
          <canvas id="analyser"></canvas>
          <canvas id="wavedisplay"></canvas>
        </div>
        </div>
        </div>
        </div>
        <BottomBar @continue-click="nextClick()" :isContinueEnabled="hasGrantedPermission" />
    `,
    methods: {
        prevClicked() {
            window.location.hash = "/";
        },
        nextClick() {
            window.location.hash = "/playground"
        },
        getMicPermission(){
            initAudio().then(() => {
                this.hasGrantedPermission = true;
            },() => {
                this.hasGrantedPermission = false;
            });

        }
    },
    data() {
        return {
            hasCheckedPermission: false,
            hasGrantedPermission: null
        }
    },
    mounted() {

    }
}
