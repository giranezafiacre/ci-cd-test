import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID_ANDROID, GOOGLE_CLIENT_ID_IOS } from "@env";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    ClientId: GOOGLE_CLIENT_ID_ANDROID,
    webClientId: GOOGLE_CLIENT_ID,
  })

export default GoogleSignin;


//scopes: ['https://www.googleapis.com/auth/drive.file'],

class GoogleAuth{
  constructor(GoogleSignin,iosClientId, ClientId, webClientId, scopes){
    this.scopes = scopes
    this.iosClientId = iosClientId
    this.webClientId = webClientId,
    this.ClientId = ClientId
    GoogleSignin.configure({
      iosClientId: iosClientId,
      ClientId: ClientId,
      webClientId: webClientId,
      scopes: scopes,
    })
    this.GoogleSignin = GoogleSignin

  }

  setScope(scopes){
    this.GoogleSignin.configure({
      iosClientId: this.iosClientId,
      ClientId: this.ClientId,
      webClientId: this.webClientId,
      scopes: scopes,
    })
  }
}


const googleAuth =  new GoogleAuth(GoogleSignin, GOOGLE_CLIENT_ID_IOS,
  GOOGLE_CLIENT_ID_ANDROID,
  GOOGLE_CLIENT_ID, [  'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'])

    export { googleAuth};

//const axios_api = new AxiosApi(null, null);