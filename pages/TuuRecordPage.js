import RecordPage from "../components/RecordPage.js";

export default {
    component: RecordPage,
    template: `
        <RecordPage 
            vowel="u" 
            sound="tū" 
            sampleFile= "oldfemale-word-tuu-R001M.wav"
            :nextUrl="{name: 'finish'}" 
        />
    `
};