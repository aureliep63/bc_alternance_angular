export const environment = {
  API_URL: 'http://localhost:8080',
  API_RESOURCES:{
    BORNES:'/bornes',
    AUTH:'/auth',
    USERS:'/utilisateurs',
    MEDIAS:'/medias',
    LIEUX:'/lieux',
    RESERVATIONS:'/reservations'
  },
  IMAGE_URL:'http://localhost:8080/bornes/upload/',
  LOCAL_STORAGE: {
    ACCESS_TOKEN: 'access_token', // disponible 20h
   // REFRESH_TOKEN: 'refresh_token' // disponible 10h
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
