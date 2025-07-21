import { SERVER_HOST, SERVER_PORT } from "@env";
import { GoogleAuthProvider } from "./Providers/Auth/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
// const Parse = require('parse/react-native.js');
import Parse from 'parse/react-native';
Parse.setAsyncStorage(AsyncStorage);
import './src/parseClassExtensions/userExtension';

const parseClientID = "myAppId";
Parse.initialize(parseClientID);
Parse.serverURL = `http://${SERVER_HOST}:${SERVER_PORT}/parse` //`http://172.29.105.50:1337/parse`
Parse.User._registerAuthenticationProvider(GoogleAuthProvider);


export default Parse