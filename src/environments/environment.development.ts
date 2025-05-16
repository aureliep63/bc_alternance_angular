export const environment = {

  // https://api.escuelajs.co => host
  // /api/v1 => version
  // /auth => resource (type)
  // /login => resource identifier
  // /email=...&?password=...&?remember=... => query string

  API_URL: 'http://localhost:8080',
  API_RESOURCES:{
    AUTH:'/auth',
    USERS:'/utilisateurs',
    MEDIAS:'/medias',
    BORNES:'/bornes',
    LIEUX:'/lieux',
    RESERVATIONS:'/reservations'
  },
  IMAGE_URL:'http://localhost:8080/bornes/upload/',
  LOCAL_STORAGE: {
    ACCESS_TOKEN: 'access_token', // disponible 20h
   // REFRESH_TOKEN: 'refresh_token' // disponible 10h
  }
};
