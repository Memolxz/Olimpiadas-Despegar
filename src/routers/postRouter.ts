import { Router } from "express"

import { PostService } from "../services/postService"

const postService = new PostService();

export const postRouter = Router()

postRouter.get('/', async (_, res) => {
  try {
    const posts = await postService.getAllPosts();
    res.status(200).json({ ok: true, data: posts })
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

postRouter.get('/:id', async (req, res) => {
  try {
    const postIdToGet = Number(req.params.id);
    const post = await postService.getPostById(postIdToGet);
    res.status(200).json({ ok: true, data: post })
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

postRouter.post('/', async (req, res) => {
  try {
    const postFromRequest = req.body;
    const postCreated = await postService.createPost({
      ...postFromRequest,
      authorId: req.context.user.id
    });
    res.status(201).json({ ok: true, data: postCreated });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

postRouter.put('/:id', async (req, res) => {
  try {
    const postIdToModify = req.params.id;
    const postFromRequest = req.body;

    const postModified = await postService.updatePost({ id: postIdToModify, ...postFromRequest });

    res.status(200).json({ ok: true, data: postModified });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

postRouter.patch('/:id', async (req, res) => {
  try {
    const postIdToModify = Number(req.params.id);
    const postFromRequest = req.body;

    const fullPost = await postService.getPostById(postIdToModify);

    // Primero desestructuro todo el fullUser, luego desestructuro los atributos que me
    // hayan pasado en el body para sobrescribir los primeros
    const fullPostBody = { ...fullPost, ...postFromRequest }

    const postModified = await postService.updatePost(fullPostBody);

    res.status(200).json({ ok: true, data: postModified });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

postRouter.delete('/:id', async (req, res) => {
  try {
    const postIdToDelete = Number(req.params.id);

    await postService.deletePost(postIdToDelete)

    res.status(200).json({ ok: true })
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})