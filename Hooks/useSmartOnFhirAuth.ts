import * as AuthSession from 'expo-auth-session'
import { JSONPath } from 'jsonpath-plus';

// how the keys will be stored
//https://docs.expo.dev/guides/authentication/#storing-data

export default function useSmartOnFhirAuth(){


    async function getEndpoints (baseUrl : string) {
        let smart_conf_url = baseUrl.concat(".well-known/smart-configuration");
  
        let response = await fetch(smart_conf_url);
        let smart_conf_json = await response.json();
  
        const endPoints = {
          authorizationEndpoint: JSONPath({path: '$.authorization_endpoint', json: smart_conf_json})[0],
          tokenEndpoint: JSONPath({path: '$.token_endpoint', json: smart_conf_json})[0],
        };
        
        return endPoints;
      }

// Gets the authentication URL query string...
const getAuthUrl = function(authEndpoint: string, 
    clientId: string, redirectUrl: string, 
    audUrl: string, state: string, scope: string, clientSecret: string): string {
    return `${authEndpoint}?` +
       `client_id=${clientId}` +
       `&redirect_uri=${redirectUrl}` +
       `&aud=${audUrl}` +
       `&state=${state}` +
       `&response_type=code` +
       `&scope=${encodeURIComponent(scope)}` +
       `&clientSecret=${encodeURIComponent(clientSecret)}`;
  }

  // Gets the tokens i.e refresh and access tokens
  const getTokenResponse = async function (tokenEndpoint: string, code: string, clientId : string, redirectUrl ){

    let tokenOptions = { 
        method: "POST", 
        headers: { "Content-Type": "application/x-www-form-urlencoded"} ,
        body:  `grant_type=authorization_code` +
                 `&code=${code}` +
                 `client_id=${clientId}` +
                 `&redirect_uri=${redirectUrl}` 
                
      }

    const tokenResponse = await fetch(tokenEndpoint, tokenOptions).then(x => x.json());

    return tokenResponse;
  }

  function generateStateValue(length = 32) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
  }

      const authenticate = async function (clientId: string, redirectUrl: string, iss: string, scope: string, clientSecret: string, state: string){

        let endPoints = await getEndpoints(iss);

        let authEndpoint = endPoints.authorizeUri 
        let tokenEndpoint = endPoints.tokenUri 

        const authUrl = getAuthUrl(authEndpoint, clientId, redirectUrl, iss, state, scope, clientSecret )

        const authResult = await AuthSession.startAsync({authUrl:authUrl})

// Check if the authentication was successful

        if (authResult.type !== "success") { return; }

        // have to implement the interfaces for objects passed to useAuthRequest

        let authRequestConfig = {
            "clientId": clientId,
            "scopes": scope.split(" "),
            "redirectUri": redirectUrl,
            "iss": iss,
            "state": state,
            "clientSecret": clientSecret,
          }

        // const discovery = AuthSession.useAutoDiscovery('https://example.com/auth');

        const discovery = await getEndpoints(iss);

        const [request, response, promptAsync] = AuthSession.useAuthRequest(authRequestConfig, discovery)

        const accessToken = tokenResponse.access_token;

      }



}