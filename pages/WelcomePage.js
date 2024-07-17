import BottomBar from "../components/BottomBar.js";


export default {
  components: { BottomBar },
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
    <BottomBar :isContinueEnabled="true" @continueClick="goNext()" /> 
    `,
  methods: {
    goNext() {
      this.$router.push({ name: "audiopermission" });
    }
  },
}