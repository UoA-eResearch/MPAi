import BottomBar from "../components/BottomBar.js";
import { config } from "../store.js";


export default {
  components: { BottomBar },
  data() {
    return {
      config
    }
  },
  template: `
    <header class="d-flex flex-row-reverse py-3">
      <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#acknowledgements" >Acknowledgements</button>
    </header>
    <div class="d-flex flex-column h-100 flex-column justify-content-center">
      <div class="text-center">
        <img src="images/tiki_glasses_single.png" height="100px"/>
        <p class="fs-4 mb-1">Kia ora, nau mai ki</p>
        <h1 class="mb-3">MPAi - the Māori Pronunciation Aid</h1>
        <p>MPAi can help compare your pronunciation of te reo Māori vowels to sounds produced by
            kaumātua and kuia (elder) speakers.</p>
      </div>
    </div>
    <div class="mb-3 col-12 col-lg-6 text-center mx-auto">
      <div class="d-inline-block">  
        <input type="radio" class="btn-check" @change="config.language = 'en'" name="lang" id="btn-en" :checked="config.language === 'en'" autocomplete="off">
        <label class="btn" for="btn-en">English</label>
      </div>
      <!-- Māori option has a popover to explain limitation of the translation. -->
      <div class="d-inline-block"
      ref="maoriToggle"
        data-bs-offset="0,15"
        data-bs-trigger="focus"
        data-bs-container="body"
        data-bs-toggle="popover"
        data-bs-placement="top"
        data-bs-content="Te reo Māori will be used for some terms."
      >
      <input type="radio" @change="config.language = 'mi'" :checked="config.language === 'mi'" class="btn-check" name="lang" id="btn-mi" autocomplete="off">
      <label class="btn" id="btn-mi-label" for="btn-mi">Te reo Māori</label>
      </div>
    </div>
    <BottomBar :isContinueEnabled="true" @continueClick="goNext()" /> 
    <div class="modal fade" id="acknowledgements" tabindex="-1" aria-labelledby="ackModalLabel" aria-hidden="true">
      <div class="modal-dialog">
      <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="ackModalLabel">Acknowledgements</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <p>The Māori Pronunciation Aid project is led by Professor Catherine Watson, Dr Justine Hui, and Dr Peter Keegan from Waipapa Taumata Rau University of Auckland.</p>
      <p>This web app is developed at the Centre for eResearch, University of Auckland, based on Watson et al. 2017. WebAssembly porting and backend development by Nick Young, frontend design and development by Noel Zeng. Source code <a href="https://github.com/uoa-eresearch/MPAi/">available on GitHub</a>.</p>
      <p>This project is funded by <a href="https://www.mbie.govt.nz/science-and-technology/science-and-innovation/funding-information-and-opportunities/investment-funds/curious-minds">Curious Minds He Hihiri i te Mahara</a> from the Ministry of Business, Innovation and Employment.</p>
      <p></p>
      <p>Emotiki is created by Te Puia.</p>
      </div>
      </div>
      </div>
    </div>

    `,
  methods: {
    goNext() {
      this.$router.push({ name: "audiopermission" });
    }
  },
  mounted() {
    new bootstrap.Popover(this.$refs.maoriToggle);
  }
}