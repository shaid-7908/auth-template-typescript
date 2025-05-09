import env from 'dotenv'

env.config()


const envConfig = {
  //Define all env variables here for ease of usage
  PORT: process.env.PORT as string,
  MONGODB_URL: process.env.MONGODB_URL as string,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_ACCESSTOKEN_TIME: process.env.JWT_ACCESSTOKEN_TIME as string,
  JWT_REFRESHTOKEN_TIME: process.env.JWT_REFRESHTOKEN_TIME as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
};

export default envConfig

