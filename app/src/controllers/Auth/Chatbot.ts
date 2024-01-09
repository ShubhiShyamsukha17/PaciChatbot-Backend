import { Request, Response } from "express";
import axios from 'axios';
import Log from "../../middlewares/Log";
import Logger from "../../models/logger.model";
import {IUser} from "../../models/user.model";

/**
 * @class Chatbot
 * @description This class is used as bridge between the chatbot and the server
 * @exports Chatbot
 */
class Chatbot {
  /**
     * @method ask
     * @description This method is used to ask the chatbot a question
     * @param {Request} req: Request of type express
     * @param {Response} res: Response of type express
     * @returns Response of type express
     */
  public static async ask(req: Request, res: Response): Promise<Response | void> {
    const { question } = req.body;
    try{
      const _user = res.locals.user as IUser;
      const ip = req.clientIp;
      // Get request send as "/response/question" question is url encoded
      const { data } = await axios.get(`${process.env.CHATBOT_URL}/response/${encodeURIComponent(question)}`);
      const logger = new Logger({
        user: _user.id,
        ip,
        question,
        data
      });
      await logger.save();

      return res.status(200).json({
        message: "Question asked",
        data
      });
    } catch (error) {
      Log.error(error);
      return res.status(500).send("Internal server error");
    }
  }
}

export default Chatbot;