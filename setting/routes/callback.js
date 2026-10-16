import express from 'express';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {exchangeCodeForToken} from "../services/eCWCodeService.js";
import {getEcwSmartEndpoints} from "../services/eCWMetaService.js"
const STATE_SECRET = "temp-sandbox-secret-change-later-123";
const router = express.Router();
const REDIRECT_URI = 'https://ecwpublicapp.onrender.com/callback';
const CLIENT_ID = process.env.CLIENT_ID;

router.get('/', async (req,res)=>{

try{
    const code = req.query.code;
    const state = req.query.state;
    console.log('App Code',code)

     if (!code || !state) {
            return res.status(400).json({ message: "Missing code or state parameter." });
     }

     //State : iss and codeVerifier inside the signed stateToken

    let decoded;

    try{

        decoded = jwt.verify(state, STATE_SECRET);

    }catch(error){

        console.log('Error while Decoding State Token', error);

    }

    const { iss, codeVerifier } = decoded;


    const {token_endpoint} = await getEcwSmartEndpoints(iss);

    const accessTokenData = await exchangeCodeForToken(code,token_endpoint,REDIRECT_URI,codeVerifier,CLIENT_ID);

    res.json(accessTokenData);

}catch(e){

    return res.status(400).json({ message: "Missing code or state parameter." }); 
};






});

export default router;