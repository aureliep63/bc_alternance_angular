export const environmentProd = {
  API_URL: 'https://bc-alternance.onrender.com', // ton URL Render
  API_RESOURCES: {
    AUTH: '/auth',
    USERS: '/utilisateurs',
    MEDIAS: '/medias',
    BORNES: '/bornes',
    LIEUX: '/lieux',
    RESERVATIONS: '/reservations'
  },
  IMAGE_URL: 'https://bc-alternance.onrender.com/bornes/upload/',
  LOCAL_STORAGE: {
    ACCESS_TOKEN: 'access_token'
  },
  firebase: {
    apiKey: "AIzaSyBN6dBBDkkWrVULJpIWqI_MS0I7S2e6Ykc",
    authDomain: "bc-angular.firebaseapp.com",
    projectId: "bc-angular",
    storageBucket: "ton-projet.appspot.com",
    messagingSenderId: "ID_MESSAGE",
    appId: "ID_APP"
  }
};
