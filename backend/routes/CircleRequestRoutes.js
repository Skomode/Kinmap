import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { sendInvitation, getMyInvitations, respondInvitation, getPendingByCircle } from "../controllers/CircleRequestController.js";

const router = express.Router();

router.post("/", authenticateToken, sendInvitation);         // enviar invitación
router.get("/mine", authenticateToken, getMyInvitations);    // ver mis invitaciones
router.put("/:id", authenticateToken, respondInvitation);    // aceptar/rechazar\
router.get("/pending/:circleId", authenticateToken, getPendingByCircle);

export default router;