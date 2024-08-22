import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            vowel="o" 
            sound="pō" 
            sampleFile= "oldfemale-word-poo-R001M.wav"
            :nextUrl="{name: 'tuu-record'}" 
        />
    `
};