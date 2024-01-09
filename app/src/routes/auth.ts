import { Router } from "express";
import Login from "../controllers/Auth/Login";
import Chatbot from "../controllers/Auth/Chatbot";

const router = Router();


// Routes for login 
router.get('/auth/renewToken/:id', Login.renewToken);

// Google oauth routes
router.get('/auth/google', Login.getGoogleAuthURL);
router.get('/auth/google/callback', Login.googleCallback);


// Routes for chatbot
router.post('/chatbot/ask', Chatbot.ask);

export default router;
