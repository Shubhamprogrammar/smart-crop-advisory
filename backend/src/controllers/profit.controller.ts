import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { calculateProfit } from "../utils/profitCalculator";
import { ProfitCalculatorInput } from "../validators/profit.validator";

export function calculate(req: Request, res: Response) {
  const input = req.body as ProfitCalculatorInput;
  const result = calculateProfit(input);
  return sendSuccess(res, { message: "Profitability estimate calculated", data: { result } });
}
