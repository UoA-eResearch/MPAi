export default {
    template: `
    <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#acknowledgements" >Acknowledgements</button>
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
`
}