export const config = Vue.reactive({
  audioInput: null,
  modelSpeaker: null,
  studyParticipantId: null,
  studyPassword: null,
  attemptsAllowed: 5,
  echo: true,
  language: 'en' // en or mi
});

export const resources = Vue.reactive({
  modelSpeakerOptions: [],
  speakerFormants: []
});