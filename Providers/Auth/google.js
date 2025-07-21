export const GoogleAuthProvider = {
    authenticate: async (options) => {
      const { idToken } = options;
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const data = await response.json();
  
      if (data.aud !== YOUR_GOOGLE_CLIENT_ID) {
        throw new Error('Invalid token');
      }
  
      return {
        id: data.sub,
        email: data.email,
        name: data.name
      };
    },
    restoreAuthentication: (authData) => {
      return true;
    },
    getAuthType: () => {
      return 'google';
    },
    deauthenticate: () => {},
  };


