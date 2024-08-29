import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="pō" 
            vowel="o"
            :nextUrl="{name: 'tuu-record'}" 
        />
    `
};