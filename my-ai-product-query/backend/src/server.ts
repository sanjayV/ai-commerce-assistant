import express from "express";
import chatRouter from "./routes/chat.route";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

// Register chat API
app.use("/api/chat", chatRouter);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});