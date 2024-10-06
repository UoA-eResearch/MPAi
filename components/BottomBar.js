export default {
    props: ['isContinueEnabled'],
    data() {
        return {
            isLoadingNextPage: false
        }
    },
    methods: {
        continueClicked() {
            this.$emit('continue-click');
            // On slow page loads, we show a loading spinner on the button
            // after a short delay, to indicate the page is working.
            setTimeout(() => {
                this.isLoadingNextPage = true;
            }, 100);
        }
    },
    template: `
    <footer id="bottom-controls" class="mb-3 d-grid col-12 col-lg-6 mx-auto">
        <a @click.prevent="continueClicked"  
        id="btn-continue" 
        class="d-block btn btn-primary" 
        :class="{disabled: !isContinueEnabled || isLoadingNextPage}"
        :aria-disabled="!isContinueEnabled || isLoadingNextPage">
        <template v-if="!isLoadingNextPage">
            Continue
        </template>
        <template v-else>
            <!-- Loading indicator while next route lazily loads. -->
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span class="visually-hidden" role="status">Loading...</span>
        </template>
        </a>
    </footer>
    `
}