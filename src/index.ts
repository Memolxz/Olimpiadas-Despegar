import "dotenv/config"

import express from 'express';

import { userRouter } from './routers/userRouter';
import { authRouter } from "./routers/authRouter";
import { postRouter } from "./routers/postRouter";

const app = express()

app.use(express.json())

app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/posts', postRouter)

app.listen(8000, () => {
  console.log(`App listening on http://localhost:8000`)
})