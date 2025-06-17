import dotenv  from "dotenv";
dotenv.config()
import { app } from "./app"
import { env } from "./env"


app
  .listen({
    port: env.PORT,
    host: ("RENDER" in process.env) ? '0.0.0.0' : 'localhost',
  })
  .then(() => {
    console.log("Billy");
  }).catch((error: any) => {
    console.error("OXI", error);
    return error;
  });





 