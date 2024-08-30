import BottomBar from "../components/BottomBar.js";
import { config } from "../store.js";


export default {
  components: { BottomBar },
  data() {
    return {
      config
    }
  },
  methods: {
    changeLanguage(lang) {
      config.language = lang;
    }
  },
  template: `
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
      <input type="radio" class="btn-check" @change="config.language = 'en'" name="lang" id="btn-en" :checked="config.language === 'en'" autocomplete="off">
      <label class="btn" for="btn-en">English</label>

      <input type="radio" @change="config.language = 'mi'" :checked="config.language === 'mi'" class="btn-check" name="lang" id="btn-mi" autocomplete="off">
      <label class="btn" for="btn-mi">Te reo Māori</label>
    </div>
    <BottomBar :isContinueEnabled="true" @continueClick="goNext()" /> 
    `,
  methods: {
    goNext() {
      this.$router.push({ name: "audiopermission" });
    }
  },
}