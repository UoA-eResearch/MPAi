import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="hē" 
            vowel="e"
            :nextUrl="{name: 'hii-record'}" 
        />
    `
};