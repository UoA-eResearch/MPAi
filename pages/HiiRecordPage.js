import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            vowel="i" 
            sound="hī" 
            sampleFile= "oldfemale-word-hii-R001M.wav"
            :nextUrl="{name: 'poo-record'}" 
        />
    `
};