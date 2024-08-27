import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="hī" 
            :nextUrl="{name: 'poo-record'}" 
        />
    `
};