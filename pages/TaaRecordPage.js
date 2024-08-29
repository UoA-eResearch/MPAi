import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            vowel="a"
            sound="tā" 
            :nextUrl="{name: 'hee-record'}" 
        />
    `
}; 