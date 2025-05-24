import express from 'express';

import { recommendCard } from '../controllers/card.controller';

const router = express.Router();

router.post('/recommend', recommendCard);

export default router;
