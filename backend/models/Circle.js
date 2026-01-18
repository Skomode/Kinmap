import mongoose from "mongoose";
const { Schema, model } = mongoose;

const circleSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    image: { type: String, default: "" }, // <--- CAMPO EXISTENTE PARA FOTO
    category: { type: String },
    color: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

export default model("Circle", circleSchema);
