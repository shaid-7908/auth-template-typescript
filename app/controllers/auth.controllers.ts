import { Request, Response,NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import UserModel,{Iuser} from "../models/user.model";
import { hashPassword } from "../utils/password";
import passport from "passport";
import Joi from "joi";
import {generateAccessToken , generateRefreshToken} from '../utils/tokenGeneration'
import envConfig from "../config/env.config";
import jwt from 'jsonwebtoken'
import { SendMailOptions } from "nodemailer";

const registerSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character",
    }),
  avatar: Joi.string().optional(),
});

class Authcontroller {
  //Register logic
  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    const { email } = value;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }
    value.password = await hashPassword(value.password);
    const newUser = await UserModel.create(value);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  });
  //Login logic
  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { user, info } = await new Promise<{
      user: Iuser | false;
      info: { message?: string } | undefined;
    }>((resolve, reject) => {
      passport.authenticate(
        "local",
        { session: false },
        (
          err: Error,
          user: Iuser | false,
          info: { message?: string } | undefined
        ) => {
          if (err) return reject(err);
          resolve({ user, info });
        }
      )(req, res);
    });
    if (!user) {
      throw new ApiError(401, info?.message || "Invalid credentials");
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, accessToken });
  });
  //refresh token logic
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new ApiError(401, "No refresh token provided");
    }

    const payload: any = await new Promise((resolve, reject) => {
      jwt.verify(token, envConfig.JWT_SECRET, (err:any, decoded:any) =>
        err
          ? reject(new ApiError(403, "Invalid or expired refresh token"))
          : resolve(decoded)
      );
    });

    
    const user = await UserModel.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      throw new ApiError(403, "Refresh token mismatch");
    }

    // 3) issue new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 4) persist rotated refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // 5) set cookie & return
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, accessToken: newAccessToken });
  });

  //logout logic
  logoutUser = asyncHandler(async (req:Request,res:Response)=>{
   const token = req.cookies.refreshToken
   if(!token){
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:true,
      sameSite: "strict",
    });
    return res.status(200).json({success:true,message:'Logout successfull'})
   }
   const payload = jwt.verify(token, envConfig.JWT_SECRET) as { id: string };
   const user = await UserModel.findById(payload.id);
   if (user) {
     user.refreshToken = "";
     await user.save(); // errors bubble to asyncHandler
   }

   res.clearCookie("refreshToken", {
     httpOnly: true,
     secure: true,
     sameSite: "strict",
   });
   res.json({ success: true, message: "Logged out successfully" });

  })
}

export default new Authcontroller()
