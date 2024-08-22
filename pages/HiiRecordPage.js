import RecordPage from "../components/RecordPage.js";

export default {
    component: RecordPage,
    template: `
        <RecordPage 
            vowel="i" 
            sound="hī" 
            sampleFile= "oldfemale-word-hii-R001M.wav"
            :nextUrl="{name: 'poo-record'}" 
        />
    `
};