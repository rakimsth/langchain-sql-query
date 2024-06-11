import express from "express";
import Audio from "../modules/audio";
import SQL from "../modules/sql";

const router = express.Router();

router.use("/api/v1/query", SQL);
// router.use("/api/v1/audio", Audio); //Discarded this API, as it takes too long to process audio file (8 secs)

export = router;
