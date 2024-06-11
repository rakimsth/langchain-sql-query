import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import express, {
  Errback,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import morgan from "morgan";

import indexRouter from "./routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());
app.use("/assets", express.static("public"));

app.use("/", indexRouter);

app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(500).json({ error: err.toString() || "Internal Server Error" });
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
