import { Request, Response } from "express";
import { v4 } from "uuid";
import axios from 'axios';
import { google } from 'googleapis';
import User, { IUser } from "../../models/user.model";
import Log from "../../middlewares/Log";

const OAuth2 = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

/**
 * @class Login
 * @description This class is used to login a user
 * @exports Login
 */
class Login {
  public static async renewToken(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const user: IUser = await User.findById(id);
      if (!user) {
        return res.status(404).send("User not found");
      }
      const token = await user.createToken();
      return res.status(200).json({
        message: "Token renewed",
        token
      });
    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }

  /**
   * @method getGoogleAuthURL
   * @description This method is used to get the google auth url
   * @param {Request} req: Request of type express
   * @param {Response} res: Response of type express
   * @returns Response of type express
   */
  public static async getGoogleAuthURL(req: Request, res: Response): Promise<Response | void> {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    
    const URL = OAuth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes
    });

    res.redirect(URL);
  }

  /**
   * @method googleCallback
   * @param req: Request of type express
   * @param res: Response of type express
   * @returns Response of type express
    */   
  public static async googleCallback(req: Request, res: Response): Promise<Response | void> {
    const code = req.query.code as string;
    try {
      const { tokens } = await OAuth2.getToken(code);

      const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,{
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        }})
        .then((res) => res.data)
        .catch((error) => {
          Log.error(error);
          return res.status(500).send("Internal server error");
        });

      const VITEmailFormat =/^[a-zA-Z]+.[a-zA-Z]+20[0,1,2][0-9]@vitstudent.ac.in/;
      if (!googleUser.email.match(VITEmailFormat)) {
        return res.status(400).send("Invalid email");
      }

      const user = await User.findOne({ email: googleUser.email });
      if (!user) {
        const newUser = new User({
          id: v4(),
          name: googleUser.name,
          email: googleUser.email,
          isVerified: true,
        });
        await newUser.save();
        const token = await newUser.createToken();

        // Cookies should be set to secure: true in production
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
        });

        const cookieSettings = {
          httpOnly: true,
          secure: false,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        };

        if (process.env.NODE_ENV === "production") {
          cookieSettings.secure = true;
        }
        res.cookie("token", token, cookieSettings);
        return res.status(200).json({
          message: "Logged in",
          token
        });
      }

    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }
}

export default Login;