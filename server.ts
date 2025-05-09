import express from "express";
import { ApiError } from "./app/utils/ApiError";
import { connectDB } from "./app/config/db.connection";
import envConfig from "./app/config/env.config";
import { authRouter } from "./app/routes/auth.route";
import passport from "./app/config/passport"
import cookieParser from "cookie-parser";

const app = express();
const PORT = envConfig.PORT;
connectDB();
app.use(express.json())
app.use(cookieParser())
app.set("view engine", "ejs");
app.set("views","views");
//Should be imported or required from your own passport.ts/js file not the passport library
app.use(passport.initialize())
app.use("/api/v1/auth", authRouter);
app.get('/verify-email',(req,res)=>{
  res.render('pages/verifyemail')
})

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (!(err instanceof ApiError)) {
      console.error("Unexpected Error:", err);
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
);
//app.use("/api", anyRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
