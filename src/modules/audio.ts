import express, { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { AssemblyAI } from "assemblyai";
import fs from "fs";

const client = new AssemblyAI({
  apiKey: String(process.env.ASSEMBLYAI_API_KEY),
});

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/");
  },
  filename: function (req, file, cb) {
    const imageName: string = "image".concat(
      "-",
      String(Date.now()),
      ".",
      String(file.originalname.split(".").pop())
    );
    cb(null, imageName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Reject files with a mimetype other than 'image/png' or 'image/jpeg'
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    const err: any = new multer.MulterError(
      "LIMIT_UNEXPECTED_FILE",
      file.fieldname
    );
    err.message = "Only single audio file is allowed";
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
    files: 1,
  },
});

router.post(
  "/",
  upload.single("audio"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded or file format is incorrect" });
      }
      const audio_url = String(
        process.env.APP_URL?.concat(
          "/assets",
          req.file.path.replace("public", "")
        )
      );
      const transcript = await client.transcripts.transcribe({
        audio_url,
      });
      if (transcript?.text) fs.unlinkSync(req.file.path);
      console.log({ data: transcript.text });
      res.json({ data: transcript.text });
    } catch (e) {
      next(e);
    }
  }
);

export = router;
