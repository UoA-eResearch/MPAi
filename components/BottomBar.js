export default {
    props: ['isContinueEnabled', 'isLoading'],
    template: `
    <footer id="bottom-controls" class="mb-3 d-grid col-12 col-lg-6 mx-auto">
        <a @click.prevent="this.$emit('continue-click')"  
        id="btn-continue" 
        class="d-block btn btn-primary" 
        :class="{disabled: !isContinueEnabled || isLoading}"
        :aria-disabled="!isContinueEnabled || isLoading">
        <template v-if="!isLoading">
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