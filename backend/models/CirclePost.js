import mongoose from "mongoose";

const CirclePostSchema = new mongoose.Schema(
  {
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🆕 añadimos "follow" como nuevo tipo
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "follow"],
      required: true,
    },

    title: { type: String },
    content: { type: String, required: true },

    // 🔥 Array de archivos multimedia
    mediaUrl: [
      {
        type: String, // URL del archivo
      },
    ],

    visibility: { type: String, default: "circle_only" },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // 🌍 Información de ubicación general
    location: { type: String, default: "Ubicación desconocida" },

    latitude: { type: Number },
    longitude: { type: Number },
    snapshotImage: { type: String },

    // 🆕 Historial de ubicaciones (para posts de seguimiento)
    locationUpdates: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // 🆕 Indica si el seguimiento sigue activo
    isFollowingActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("CirclePost", CirclePostSchema);
