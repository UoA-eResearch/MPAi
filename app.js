import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import WelcomePage from './pages/WelcomePage.js';
import AudioPermissionPage from './pages/AudioPermissionPage.js';
import PlaygroundPage from './pages/PlaygroundPage.js';
import RecordPage from './pages/RecordPage.js';

const routes = {
    '/': WelcomePage,
    '/audiopermission': AudioPermissionPage,
    '/playground': PlaygroundPage,
    '/record': RecordPage
}

const app = createApp({
    data() {
        return {
            currentPath: window.location.hash,
            canProceed: true
        }
    },
    computed: {
        currentView() {
            return routes[this.currentPath.slice(1) || '/'] || NotFound
        },
        isOnFirstPage() {
            console.log(this.currentPath);
            return this.currentPath.slice(1) === "/" || this.currentPath === '';
        }
    },
    mounted() {
        window.addEventListener('hashchange', () => {
            this.currentPath = window.location.hash
        });

    },
    methods: {
        goPreviousPage() {
            const routeUris = Object.keys(routes);
            const currentRouteIdx = routeUris.indexOf(this.currentPath.slice(1) || '/');
            const previousIdx = currentRouteIdx - 1;
            if (currentRouteIdx === -1 || previousIdx == -1) {
                return;
            }
            window.location.hash = routeUris[previousIdx];
        },
        goNextPage() {
            if (!this.canProceed) {
                return;
            }
            const routeUris = Object.keys(routes);
            const currentRouteIdx = routeUris.indexOf(this.currentPath.slice(1) || '/');
            const nextIdx = currentRouteIdx + 1;
            if (currentRouteIdx === -1 || nextIdx > (routeUris.length - 1)) {
                return;
            }
            window.location.hash = routeUris[currentRouteIdx + 1];


        }
    }
});
app.mount("#doc")