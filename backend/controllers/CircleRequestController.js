import Invitation from "../models/CircleRequest.js";
import Circle from "../models/Circle.js";

// Enviar invitación
export const sendInvitation = async (req, res) => {
  try {
    const { circleId, recipientId } = req.body;
    
    const invitation = new Invitation({
      circleId,
      inviterId: req.user._id,
      inviteeId: recipientId,

    });

    await invitation.save();
    res.status(201).json({ message: "Invitación enviada", invitation });
  } catch (error) {
    console.error("❌ Error al enviar invitación:", error);
    res.status(500).json({ error: "Error al enviar invitación" });
  }
};  

// Obtener invitaciones
export const getMyInvitations = async (req, res) => {
  try {
    const invites = await Invitation.find({ inviteeId: req.user._id})
      .populate("circleId", "name description image")
      .populate("inviterId", "firstName lastName email ")

    res.json(invites);
  } catch (error) {
    console.error("❌ Error al obtener invitaciones:", error);
    res.status(500).json({ error: "Error al obtener invitaciones" });
  }
};

// Aceptar o rechazar
export const respondInvitation = async (req, res) => {
  try {
    const { status } = req.body; // "accepted" o "rejected"

    const invite = await Invitation.findById(req.params.id);
    if (!invite) return res.status(404).json({ error: "Invitación no encontrada" });

    if (invite.inviteeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await invite.deleteOne();

    if (status === "accepted") {
      await Circle.findByIdAndUpdate(invite.circleId, {
        $addToSet: { members: req.user._id },
      });
    }

    res.json({ message: `Invitación ${status}` });
  } catch (error) {
    console.error("Error al responder invitación:", error);
    res.status(500).json({ error: "Error al responder invitación" });
  }
};

export const getPendingByCircle = async (req, res) => {
  try {
    const { circleId } = req.params;

    const pending = await Invitation.find({ circleId })
      .select("inviteeId");

    res.json(pending);
  } catch (error) {
    console.error("❌ Error al obtener invitaciones pendientes:", error);
    res.status(500).json({ error: "Error al obtener invitaciones pendientes" });
  }
};