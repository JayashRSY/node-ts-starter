import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { getCardRecommendation, extractStatementDataFromPdf } from '../services/ai.service'; // Updated import
import catchAsync from '../utils/catchAsync.ts';
import CardStatementModel from '../models/card.model.ts';

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

export const uploadStatement = catchAsync(async (req: Request, res: Response) => {
  // Check if user is authenticated
  if (!req.user || !req.user.sub) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const file = req.file;
  if (!file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Check MIME type
  if (file.mimetype !== 'application/pdf') {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Uploaded file is not a PDF.',
    });
  }

  try {
    // Use the buffer directly from multer's memory storage
    const pdfBuffer = file.buffer;

    const extractedDataString = await extractStatementDataFromPdf(pdfBuffer);
    
    // Parse the extracted data
    const extractedData = JSON.parse(extractedDataString);
    
    // Save the extracted data to the database with user ID
    const savedStatement = await CardStatementModel.create({
      ...extractedData,
      user: req.user.sub,
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Statement data extracted and saved successfully',
      data: savedStatement,
    });
  } catch (err: any) {
    console.error("[extractStatement] PDF parse error:", err);
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Failed to extract data from PDF. The file may be corrupted or not a valid PDF statement.',
      error: err?.message || 'Unknown error',
    });
  }
});

export const getStatements = catchAsync(async (req: Request, res: Response) => {
  const statements = await CardStatementModel.find({ user: req?.user?.sub });
  return res.status(httpStatus.OK).json({
    success: true,
    message: 'Statements fetched successfully',
    data: statements,
  });
});
