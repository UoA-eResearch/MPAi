import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            vowel="u" 
            sound="tū" 
            sampleFile= "oldfemale-word-tuu-R001M.wav"
            :nextUrl="{name: 'finish'}" 
        />
    `
};