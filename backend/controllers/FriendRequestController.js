import FriendRequest from '../models/FriendRequest.js';
import Friendship from '../models/Friendship.js';
import User from '../models/User.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientEmail, message } = req.body;
    const senderId = req.user.id;

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ error: 'No se encontró un usuario con ese email' });
    }

    if (senderId === recipient._id.toString()) {
      return res.status(400).json({ error: 'No puedes enviarte una solicitud a ti mismo' });
    }

    const existingFriendship = await Friendship.findOne({
      users: { $all: [senderId, recipient._id] },
      isActive: true
    });
    if (existingFriendship) {
      return res.status(400).json({ error: 'Ya son amigos' });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      recipient: recipient._id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'Ya existe una solicitud pendiente a este usuario' });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      recipient: recipient._id,
      message: message || ''
    });

    await friendRequest.save();
    await friendRequest.populate('sender', 'firstName lastName email profilePicture');

    res.status(201).json({
      message: 'Solicitud de amistad enviada correctamente',
      friendRequest
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getReceivedFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('sender', 'firstName lastName email profilePicture')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error getting received requests:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getSentFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    })
    .populate('recipient', 'firstName lastName email profilePicture')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error getting sent requests:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (friendRequest.recipient.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para responder esta solicitud' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Esta solicitud ya fue respondida' });
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    if (action === 'accept') {
      const existingFriendship = await Friendship.findOne({
        users: { $all: [friendRequest.sender, friendRequest.recipient] },
        isActive: true
      });
      if (!existingFriendship) {
        const friendship = new Friendship({
          users: [friendRequest.sender, friendRequest.recipient]
        });
        await friendship.save();
      }
    }

    await friendRequest.populate('sender', 'firstName lastName email profilePicture');

    res.json({
      message: action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada',
      friendRequest
    });

  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
