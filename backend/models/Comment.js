import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxLength: 500 },
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });

export default model("Comment", commentSchema);
