import express, { Express } from "express";
import dotenv from "dotenv";
import router from "./routes/routes"
import * as models from "./models"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;



app.use(express.json())

models.initDB()

app.use(router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});