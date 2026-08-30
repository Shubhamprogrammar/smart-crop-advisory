/**
 * Promotes an existing user to "admin" or "expert" by email or phone.
 *
 * There is no public registration path for admin/expert accounts (register
 * always creates role "farmer" — see auth.validator.ts) by design, so the
 * first admin has to be bootstrapped directly against the database, the
 * same way seedCrops.ts bootstraps the crop catalog.
 *
 * Run: npx tsx src/scripts/promoteUser.ts <email-or-phone> <admin|expert>
 */
import mongoose from "mongoose";
import { env } from "../config/env";
import { User } from "../models/User.model";
import { logger } from "../utils/logger";

async function main() {
  const [identifier, role] = process.argv.slice(2);

  if (!identifier || (role !== "admin" && role !== "expert")) {
    logger.error("Usage: npx tsx src/scripts/promoteUser.ts <email-or-phone> <admin|expert>");
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);
  logger.info("Connected for user promotion");

  const user = await User.findOneAndUpdate(
    { $or: [{ email: identifier.toLowerCase() }, { phone: identifier }] },
    { $set: { role } },
    { new: true }
  );

  if (!user) {
    logger.error(`No user found with email/phone "${identifier}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  logger.info(`Promoted "${user.name}" (${identifier}) to role "${role}"`);
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error("User promotion failed", { err });
  process.exit(1);
});
