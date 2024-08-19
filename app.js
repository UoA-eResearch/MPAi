import WelcomePage from './pages/WelcomePage.js';
import AudioPermissionPage from './pages/AudioPermissionPage.js';
import PlaygroundPage from './pages/PlaygroundPage.js';
import RecordPage from './pages/RecordPage.js';
import { config } from './store.js';

/**
 * Navigation guard to ensure audio permission is obtained and default audio device is selected.
 * @param {object} to Path to navigate to
 * @param {object} from Path to navigate from
 * @returns If check succeeds, returns true, otherwise returns audio permission route.
 */
async function checkAudioPermission(to, from) {
    var hasGrantedPermission = await AudioPermissionPage.methods.getMicPermission()
    if (!hasGrantedPermission) {
        return { name: 'audiopermission' };
    }
    return true;
}

const appRoutes = [
    { name: 'welcome', path: '/', component: WelcomePage },
    { name: 'audiopermission', path: '/audiopermission', component: AudioPermissionPage },
    { name: 'playground', path: '/playground', component: PlaygroundPage, beforeEnter: checkAudioPermission },
    { name: 'record', path: '/record', component: RecordPage, beforeEnter: checkAudioPermission }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: appRoutes
});

const app = Vue.createApp({});
app.use(router);
app.mount("#doc");