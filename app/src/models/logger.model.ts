import mongoose from "mongoose";

export type LoggerDocument = mongoose.Document & {
    request: string,
    response: string,
    userID: string,
    ip: string,
    createdAt: Date;
}

const LoggerSchema: mongoose.Schema = new mongoose.Schema({
  request: { type: String, required: true },
  response: { type: String, required: true },
  userID: { type: String, required: true },
  ip: { type: String, required: true },
  createdAt: { type: Date, required: true }
});

const Logger = mongoose.model<LoggerDocument>("Logger", LoggerSchema);

export default Logger;