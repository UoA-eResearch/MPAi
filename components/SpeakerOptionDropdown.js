import { config,resources } from "../store.js";

export default {
    data(){
        return {
            config,
            resources
        }
    },
    methods: {
        speakerChanged(name) {
            const speakers = this.resources.modelSpeakerOptions;
            this.config.modelSpeaker = speakers.find(speaker => speaker.name === name);
        }
    },
    template: `
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Speaker: {{config.modelSpeaker.displayName}}
            </button>
            <ul class="dropdown-menu" role="menu">
                <li role="menuitemradio" v-for="speaker in resources.modelSpeakerOptions" class="dropdown-item" @click="speakerChanged(speaker.name)">
                <input class="form-check-input me-1" type="radio" :checked="speaker.name == config.modelSpeaker.name" :value="speaker.name" :id="'speaker-' + speaker.name">
                <label class="form-check-label" :for="'speaker-' + speaker.name">{{speaker.displayName}}</label>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li role="menuitemcheckbox" class="w-100 dropdown-item" @click="config.echo = !config.echo">
                <div class="d-flex">
                    <input class="form-check-input me-1" type="checkbox" :checked="config.echo" id="echo-option-checkbox">
                    <div>
                        <label class="form-check-label" for="echo-option-checkbox">Echo</label>
                        <p class="fw-light">Play back your pronunciation.</p>
                    </div>
                </div>
                </li>
            </ul>
        </div>

    `
}
