import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction {
  date: string;
  description: string;
  amount: string;
}

export interface IStatementPeriod {
  from: string;
  to: string;
}

export interface ICategoryBreakdown {
  category: string;
  amount: number;
}

export interface ICardStatement extends Document {
  card_holder_name: string;
  card_number_last4: string;
  statement_period: IStatementPeriod;
  total_due: string;
  minimum_due: string;
  due_date: string;
  transactions: ITransaction[];
  reward_points_earned?: string | null;
  reward_points_redeemed?: string | null;
  total_spent?: string | null;
  category_breakdown?: ICategoryBreakdown[] | null;
  user: mongoose.Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  date: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
});

const StatementPeriodSchema = new Schema<IStatementPeriod>({
  from: { type: String, required: true },
  to: { type: String, required: true },
});

const CategoryBreakdownSchema = new Schema<ICategoryBreakdown>({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
});

const CardStatementSchema = new Schema<ICardStatement>({
  card_holder_name: { type: String, required: true },
  card_number_last4: { type: String, required: true },
  statement_period: { type: StatementPeriodSchema, required: true },
  total_due: { type: String, required: true },
  minimum_due: { type: String, required: true },
  due_date: { type: String, required: true },
  transactions: { type: [TransactionSchema], required: true },
  reward_points_earned: { type: String, default: null },
  reward_points_redeemed: { type: String, default: null },
  total_spent: { type: String, default: null },
  category_breakdown: { type: [CategoryBreakdownSchema], default: null },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const CardStatementModel = mongoose.model<ICardStatement>("CardStatement", CardStatementSchema);

export default CardStatementModel; 