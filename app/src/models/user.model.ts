import mongoose from "../providers/Database";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import Token from "./token.model";

export interface IUser extends mongoose.Document {
    email: string;
    name: string;
  comparePassword: (password: string) => Promise<boolean>;
    createToken: () => object;
    renewToken: (refreshToken: string) => object;
}

export const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true }
}, {
  timestamps: true
});


UserSchema.methods.createToken = function () {
  const user = this as IUser;
  const token = jwt.sign({ 
    id: user._id 
  }, process.env.JWT_SECRET, {
    expiresIn: 86400, // 1 day
  });
    
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + 1);
    
  const _refreshToken = v4();
  const refreshToken = new Token({
    token: _refreshToken,
    user: user._id,
    expiryDate: expiredDate
  });
  return { accessToken: token, refreshToken: refreshToken };
};

UserSchema.methods.renewToken = async function (refreshToken: string) {
  const user = this as IUser;
  const token = await Token.findOne({ token: refreshToken });
  if (!token) {
    throw new Error("Invalid refresh token");
  }
  if (token.user.toString() !== user._id.toString()) {
    throw new Error("Invalid refresh token");
  }
  if (token.expiryDate < new Date()) {
    throw new Error("Refresh token expired");
  }
  const newToken = jwt.sign({ 
    id: user._id 
  }, process.env.JWT_SECRET, {
    expiresIn: 86400, // 1 day
  });
  return { accessToken: newToken, refreshToken: token };
};


const User = mongoose.model<IUser>("User", UserSchema);

export default User;