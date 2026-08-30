import { Schema, model, Document, Types } from "mongoose";
import { NOTIFICATION_TYPES, NotificationType, NOTIFICATION_CHANNELS, NotificationChannel } from "../constants/enums";

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedAdvisory?: Types.ObjectId;
  isRead: boolean;
  channel: NotificationChannel;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 1000 },
    relatedAdvisory: { type: Schema.Types.ObjectId, ref: "Advisory" },
    isRead: { type: Boolean, default: false },
    channel: { type: String, enum: NOTIFICATION_CHANNELS, default: "browser" },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
