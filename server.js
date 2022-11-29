import express from 'express';
const app = express();

app.all("/", (req, res) => {
  res.send("Grid me up baby")
})

export function keepAlive() {
  app.listen(3000, () => {
    console.log("Server is ready.")
  })
}