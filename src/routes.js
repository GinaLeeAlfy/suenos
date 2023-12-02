import express from 'express';
import { getWishes, getWishById, addWish, updateWish } from './db.js';
import { shuffleArray } from './utilities.js';

const router = express.Router();

router.get('/wishes', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        // Verify limit is a number
        if (isNaN(limit)) {
            res.status(400).send('Invalid limit');
            return;
        }
        const threshold = 50;
        const highPercentage = 0.1;
        const numberOverThreshold = Math.ceil(limit * highPercentage);
        let numberUnderThreshold = limit - numberOverThreshold;
        const randomOverThresholdRows = await getWishes(
            numberOverThreshold,
            'over',
            threshold
        );
        // Handle not enough high vote count.
        if (randomOverThresholdRows.length < numberOverThreshold) {
            numberUnderThreshold +=
                numberOverThreshold - randomOverThresholdRows.length;
        }
        const randomUnderThresholdRows = await getWishes(
            numberUnderThreshold,
            'under',
            threshold
        );
        // Combine and randomize the results
        const combinedRows = [
            ...randomOverThresholdRows,
            ...randomUnderThresholdRows,
        ];
        shuffleArray(combinedRows);
        res.json(combinedRows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/wishes', async (req, res) => {
    try {
        const { content } = req.body;
        await addWish(content);
        res.status(201).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.patch('/wishes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { votes } = req.body;
        const wish = await getWishById(id);
        // Reject if the wish does not exist
        if (wish.length === 0) {
            res.status(404).send('Wish not found');
            return;
        }
        const originalVotes = wish[0].votes;
        // Reject if the votes are the same
        if (votes === originalVotes) {
            res.status(400).send('Same vote count');
            return;
        }
        // Reject if votes are not a delta of one
        if (Math.abs(votes - originalVotes) !== 1) {
            res.status(400).send('Invalid vote count');
            return;
        }
        await updateWish(id, votes);
        res.status(201).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
