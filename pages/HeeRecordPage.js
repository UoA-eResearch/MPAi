import RecordPage from "../components/RecordPage.js";

export default {
    component: RecordPage,
    template: `
        <RecordPage 
            vowel="e" 
            sound="hē" 
            sampleFile= "oldfemale-word-hee-R001M.wav"
            :nextUrl="{name: 'hii-record'}" 
        />
    `
};