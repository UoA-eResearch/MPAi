import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            vowel="a" 
            sound="tā" 
            sampleFile="oldfemale-word-taa-R001M.wav"
            :nextUrl="{name: 'hee-record'}" 
        />
    `
};  