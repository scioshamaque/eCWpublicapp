import express from 'express';
const app=express();
const PORT = 2500;

import launchRoute from "./setting/routes/launch.js";
import callbackRoute from "./setting/routes/callback.js";



app.use("/launch", launchRoute);
app.use("/callback", callbackRoute);

app.listen(PORT, ()=>{

    console.log('Application running on PORT 2500');

})