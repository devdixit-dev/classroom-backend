import express from "express";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Backend is running." });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Listening at http://localhost:${PORT}/`);
});