import pool from './config.js';

export async function getWishes(limit, conditional, threshold) {
    try {
        const result = await pool.query(
            `SELECT * FROM wishes WHERE votes ${
                conditional === 'over' ? '>' : '<='
            } $1 ORDER BY RANDOM() LIMIT $2`,
            [threshold, limit]
        );
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getWishById(id) {
    try {
        const result = await pool.query(`SELECT * FROM wishes WHERE id = $1`, [
            id,
        ]);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function addWish(content) {
    try {
        await pool.query('INSERT INTO wishes (content) VALUES ($1)', [content]);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function updateWish(id, votes) {
    try {
        await pool.query('UPDATE wishes SET votes = $1 WHERE id = $2', [
            votes,
            id,
        ]);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
