import jwt from 'jsonwebtoken'
import { Iuser } from '../models/user.model'
import envConfig from '../config/env.config'

export const generateAccessToken = (user:Iuser)=>{
    return jwt.sign({email:user.email,id:user._id},envConfig.JWT_SECRET,{expiresIn:'1d'})
}

export const generateRefreshToken = (user:Iuser)=>{
    return jwt.sign({email:user.email,id:user._id},envConfig.JWT_SECRET,{expiresIn:'7d'})
}

