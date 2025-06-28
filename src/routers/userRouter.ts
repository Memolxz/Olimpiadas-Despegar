import { Router } from "express"

import { UserService } from "../services/userService"

const userService = new UserService();

export const userRouter = Router()

userRouter.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ ok: true, data: users })
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

userRouter.get('/:id', async (req, res) => {
  try {
    const userIdToGet = Number(req.params.id);
    const user = await userService.getUserProfileById(userIdToGet);
    res.status(200).json({ ok: true, data: user })
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

userRouter.put('/:id', async (req, res) => {
  try {
    const userIdToModify = req.params.id;
    const userFromRequest = req.body;

    const userModified = await userService.updateUser({ id: userIdToModify, ...userFromRequest });

    res.status(200).json({ ok: true, data: userModified });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

userRouter.patch('/:id', async (req, res) => {
  try {
    const userIdToModify = Number(req.params.id);
    const userFromRequest = req.body;

    const fullUser = await userService.getUserById(userIdToModify);

    // Primero desestructuro todo el fullUser, luego desestructuro los atributos que me
    // hayan pasado en el body para sobrescribir los primeros
    const fullUserBody = { ...fullUser, ...userFromRequest }

    const userModified = await userService.updateUser(fullUserBody);

    res.status(200).json({ ok: true, data: userModified });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})

userRouter.delete('/:id', async (req, res) => {
  try {
    const userIdToDelete = Number(req.params.id);

    await userService.deleteUser(userIdToDelete)

    res.status(200).json({ ok: true })
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as any).message })
  }
})