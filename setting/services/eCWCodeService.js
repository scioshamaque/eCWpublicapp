import axios from "axios";
import qs from 'qs';


export async function exchangeCodeForToken(code,token_endpoint,REDIRECT_URI,codeVerifier,CLIENT_ID){

    try{

        const response = await axios.post(token_endpoint,
        qs.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        return response.data;


    }catch(error){

    console.log("Status:", error.response?.status);
    console.log("Headers:", error.response?.headers);
    console.log("Data:", error.response?.data);
    };


    
};