import WelcomePage from './pages/WelcomePage.js';
import AudioPermissionPage from './pages/AudioPermissionPage.js';
import PlaygroundPage from './pages/PlaygroundPage.js';
import { config, resources } from './store.js';
import { fetchKaumatuaFormants } from './audio.js'
import TaaRecordPage from './pages/TaaRecordPage.js';
import HeeRecordPage from './pages/HeeRecordPage.js';
import HiiRecordPage from './pages/HiiRecordPage.js';
import PooRecordPage from './pages/PooRecordPage.js';
import TuuRecordPage from './pages/TuuRecordPage.js';
import FinishPage from './pages/FinishPage.js';
import ModelSpeakerPage from './pages/ModelSpeakerPage.js';

window.config = config;


/**
 * Navigation guard to ensure audio permission is obtained and default audio device is selected.
 * @param {object} to Path to navigate to
 * @param {object} from Path to navigate from
 * @returns If check succeeds, returns true, otherwise returns audio permission route.
 */
async function checkAudioPermission(to, from) {
    // if (navigator.permissions) {
    //     const audioPermStatus = await navigator.permissions.query({name: "microphone"});
    //     if (audioPermStatus.state == 'granted') {

    //     }
    // }
    if (!config.audioInput) {
        return { name: 'audiopermission' };
    }
    return true;
}

const appRoutes = [
    { name: 'welcome', path: '/', component: WelcomePage },
    { name: 'audiopermission', path: '/audiopermission', component: AudioPermissionPage },
    { name: 'playground', path: '/playground', component: PlaygroundPage, beforeEnter: checkAudioPermission },
    { name: "model-speaker", path: "/model-speaker", component: ModelSpeakerPage },
    { name: 'taa-record', path: '/taa-record', component: TaaRecordPage, beforeEnter: checkAudioPermission },
    { name: 'hee-record', path: '/hee-record', component: HeeRecordPage, beforeEnter: checkAudioPermission },
    { name: 'hii-record', path: '/hii-record', component: HiiRecordPage, beforeEnter: checkAudioPermission },
    { name: 'poo-record', path: '/poo-record', component: PooRecordPage, beforeEnter: checkAudioPermission },
    { name: 'tuu-record', path: '/tuu-record', component: TuuRecordPage, beforeEnter: checkAudioPermission },
    { name: 'finish', path: '/finish', component: FinishPage }
];


const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: appRoutes
});

// Grab participant id and password, put into config.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("participant_id")) {
    console.log(`Participant ID ${urlParams.get('participant_id')} and password in URL, saving.`)
    config.studyParticipantId = urlParams.get('participant_id');
    config.studyParticipantPassword = urlParams.get('password');
}

// Fetch model speakers and select the first one as default.
resources.modelSpeakerOptions = await (await fetch("samples/samples.json")).json();
resources.speakerFormants = await fetchKaumatuaFormants();
// Set model speaker to default to first in options.
config.modelSpeaker = resources.modelSpeakerOptions[0];

const app = Vue.createApp({});
app.use(router);
app.mount("#doc");