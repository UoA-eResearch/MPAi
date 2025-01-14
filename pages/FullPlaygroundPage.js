import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import PlaygroundView from "../components/PlaygroundView.js";
import { config, resources } from '../store.js'


export default {
    components: { TopBar, TikiMessage, PlaygroundView },
    template: `
    <TopBar @prev-click="prevClicked()" />
    <TikiMessage>Experiment with making different sounds.</TikiMessage>
    <PlaygroundView :showEllipses="true" />
    `
};