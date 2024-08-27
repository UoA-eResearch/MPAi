import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="pō" 
            :nextUrl="{name: 'tuu-record'}" 
        />
    `
};