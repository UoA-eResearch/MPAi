import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="tū" 
            :nextUrl="{name: 'finish'}" 
        />
    `
};