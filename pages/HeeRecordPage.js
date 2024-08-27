import RecordPage from "../components/RecordPage.js";

export default {
    components: { RecordPage },
    template: `
        <RecordPage 
            sound="hē" 
            :nextUrl="{name: 'hii-record'}" 
        />
    `
};