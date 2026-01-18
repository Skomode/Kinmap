import mongoose from "mongoose";
const { Schema, model } = mongoose;

const invitationSchema = new Schema(
  {
    circleId: { type: Schema.Types.ObjectId, ref: "Circle", required: true },
    inviterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inviteeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default model("Invitation", invitationSchema);