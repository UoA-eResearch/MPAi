import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import PlaygroundView from "../components/PlaygroundView.js";
import { config, resources } from '../store.js'
import AcknowledgementButton from "../components/AcknowledgementButton.js";
import SpeakerOptionDropdown from "../components/SpeakerOptionDropdown.js";


export default {
    components: { AcknowledgementButton, TopBar, TikiMessage, PlaygroundView, SpeakerOptionDropdown },
    template: `
    <TopBar :hideBackButton="true">
      <AcknowledgementButton />
      <SpeakerOptionDropdown />
    </TopBar>
    <TikiMessage>Experiment with making different sounds.</TikiMessage>
    <PlaygroundView :showEllipses="true" />
    `
};