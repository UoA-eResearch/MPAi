export default {
    props: ['isContinueEnabled'],
    template: `
    <div id="bottom-controls" class="mb-3 d-grid col-12 col-lg-6 mx-auto">
        <a @click.prevent="$emit('continue-click')"  
        id="btn-continue" 
        class="d-block btn btn-primary" 
        :class="{disabled: !isContinueEnabled}"
        :aria-disabled="!isContinueEnabled">Continue</a>
    </div>
    `
}