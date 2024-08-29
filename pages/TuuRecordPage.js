import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="tū" 
            vowel="u"
            :nextUrl="{name: 'finish'}" 
        />
    `
};