import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { getCardRecommendation } from '../services/ai.service';
import catchAsync from '../utils/catchAsync.ts';

export const recommendCard = catchAsync(async (req: Request, res: Response) => {
  const {
    amount,
    platform,
    category,
    transactionMode,
    cards
  } = req.body;

  // Basic validation
  if (!amount || !platform || !category || !transactionMode) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Missing required fields: amount, platform, category, transactionMode',
    });
  }

  const recommendedCard = await getCardRecommendation(amount, platform, category, transactionMode, cards);
  let recommendedCardData;
  try {
    recommendedCardData = JSON.parse(recommendedCard);
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to parse recommendation result',
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: 'Card recommendation received',
    data: recommendedCardData,
  });
});
