import express from 'express';
import jwt from "jsonwebtoken";
import crypto from "crypto";
const router = express.Router();
import { getEcwSmartEndpoints } from "../services/eCWMetaService.js";

const CLIENT_ID=process.env.CLIENT_ID;
const REDIRECT_URI=process.env.REDIRECT_URI;
const STATE_SECRET = "temp-sandbox-secret-change-later-123";

router.get('/', async (req,res)=>{

    const iss = req.query.iss;
    const launch = req.query.launch;

    if(!iss || !launch){

        return res.send("ISS and Launch Context Missing from eCW");

    }

    const {authorization_endpoint} = await getEcwSmartEndpoints(iss);

    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Carry iss + codeVerifier through state itself — don't rely on the
    // session cookie, since it's set inside a third-party iframe and gets
    // blocked/dropped by the browser before the redirect back ever happens.
    
    const stateToken = jwt.sign(
        { iss, codeVerifier },
        STATE_SECRET,
        { expiresIn: 300 }
    );

    const codeChallenge = crypto.createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');


    const params= new URLSearchParams({
        response_type:'code',
        client_id:CLIENT_ID,
        redirect_uri:REDIRECT_URI,
        launch:launch,
        state:stateToken
        ,
        scope:"launch openid fhirUser user/Patient.read",
        aud:iss,
        code_challenge:codeChallenge,
        code_challenge_method:'S256'


    })

        const authorizeUrl = `${authorization_endpoint}?${params.toString()}`;

    console.log('AuthorizeURL', authorizeUrl);

    const escapeIframeHtml = `
<!DOCTYPE html>
<html>
  <head><title>Redirecting...</title></head>
  <body>
    <script>
      window.top.location.href = ${JSON.stringify(authorizeUrl)};
    </script>
    <p>Redirecting to eClinicalWorks authorization...</p>
  </body>
</html>
`;

    res.set("Content-Type", "text/html");
    return res.send(escapeIframeHtml);



})

export default router;