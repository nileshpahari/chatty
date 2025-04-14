import dotenv from "dotenv";
import app from "./app"
import {dbConnect} from "./db/index"

dotenv.config();

const port = process.env.PORT || 5001;

dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log("http server started at port ", port);
    });
  })
  .catch((err: any) => {
    console.log("failed to connect to db, exiting...\n", err);
  });
