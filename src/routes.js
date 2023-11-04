import express from 'express'
import { getWishes, addWish, updateWish } from './db.js'

const router = express.Router()

router.get('/wishes', async (req, res) => {
    try {
        const wishes = await getWishes()
        res.json(wishes)
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
})

router.post('/wishes', async (req, res) => {
    try {
        const { content } = req.body
        await addWish(content)
        res.status(201).send()
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
})

router.patch('/wishes/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { votes } = req.body
        await updateWish(id, votes)
        res.status(201).send()
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
})

export default router
