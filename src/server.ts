import { app } from "./app"
import { env } from "./env"


app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Billy");
  }).catch((error: any) => {
    console.error("OXI", error);
    return error;
  });





 