import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="hī" 
            vowel="i"
            :nextUrl="{name: 'poo-record'}" 
        />
    `
};