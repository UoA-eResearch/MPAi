import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="tā" 
            :nextUrl="{name: 'hee-record'}" 
        />
    `
}; 