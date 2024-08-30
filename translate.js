import { config } from "./store.js"

const strings = {
    "en": await (await fetch("l11n/en.json")).json(),
    "mi": await (await fetch("l11n/mi.json")).json()
};

export default {
    install(app, _) {
        app.config.globalProperties.$t = (key) => {
            const lang = config.language;
            return strings[lang][key];
        };
    }
}