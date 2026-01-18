import mongoose from "mongoose";
const { Schema, model } = mongoose;

const likeSchema = new Schema(
  {
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: "CirclePost",
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    }
  },
  { timestamps: true }
);

// Índice compuesto para evitar likes duplicados del mismo usuario al mismo post
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Índice para consultas por usuario (ver todos los likes de un usuario)
likeSchema.index({ userId: 1 });

export default model("Like", likeSchema);