import { config, resources } from "../store.js";
import SpeakerOptionDropdown from "./SpeakerOptionDropdown.js";

export default {
  props: ['hideBackButton'],
  data() {
    return {
      speakers: [],
      config,
      resources
    }
  },
  template: `
    <header class="d-flex justify-content-between py-3">
    <div>
      <a v-if="!hideBackButton" href="#" @click.prevent="$emit('prev-click')" class="icon-link">
        <svg role="img" aria-label="Back to previous screen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-left text-secondary" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
        </svg>
        </a>
    </div>
    <div class="d-flex gap-2">
      <slot></slot>
    </div>
    </header>
    `,

}