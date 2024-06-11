import express, { Request, Response, NextFunction } from "express";
// Langchain Imports
import { ChatOpenAI } from "@langchain/openai";
import { createSqlQueryChain } from "langchain/chains/sql_db";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { QuerySqlTool } from "langchain/tools/sql";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const router = express.Router();
const datasource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_UN,
  password: process.env.PG_PW,
  database: process.env.PG_DB,
  entities: [],
  logging: false,
  migrations: [],
  subscribers: [],
  synchronize: true,
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = req.body.question;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
    });
    const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
    const executeQuery = new QuerySqlTool(db);
    const writeQuery = await createSqlQueryChain({
      llm,
      db,
      dialect: "postgres",
    });
    const answerPrompt = PromptTemplate.fromTemplate(`
        Given the following user question, corresponding SQL query, and SQL result, answer the user question.
        
        Question: {question}
        SQL Query: {query}
        SQL Result: {result}
        Answer: `);
    const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());
    const chain = RunnableSequence.from([
      RunnablePassthrough.assign({ query: writeQuery }).assign({
        result: (i: { query: string }) => executeQuery.invoke(i.query),
      }),
      answerChain,
    ]);
    const result = await chain.invoke({ question });
    res.json({ data: result });
  } catch (error) {
    console.error("Error processing query:", error);
    next(error);
  }
});

export = router;
