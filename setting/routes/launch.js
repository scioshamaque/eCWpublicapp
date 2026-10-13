import express from 'express';
import jwt from "jsonwebtoken";
import crypto from "crypto";
const router = express.Router();
import { getEcwSmartEndpoints } from "../services/eCWMetaService.js";

const CLIENTID=process.env.CLIENTID;
const REDIRECTURL=process.env.REDIRECTURI;
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
        response_type:'Code',
        client_id:CLIENTID,
        redirect_uri:REDIRECTURL,
        launch:launch,
        state:stateToken
        ,
        scope:"launch openid fhirUser user/Patient.read patient/Patient.read",
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