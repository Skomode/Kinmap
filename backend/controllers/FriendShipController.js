import Friendship from '../models/Friendship.js';
import dotenv from 'dotenv';
dotenv.config();

export const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await Friendship.find({
      users: userId,
      isActive: true
    }).populate('users', 'firstName lastName email phone isActive lastLogin profilePicture');

    const friends = friendships
      .map(friendship => {
        const friend = friendship.users.find(
          user => user && user._id.toString() !== userId
        );

        if (!friend) return null; // <-- filtramos usuarios nulos

        // Asignar estado directamente
        friend.status = friend.isActive
          ? 'Activo'
          : friend.lastLogin
          ? `Última conexión: ${new Date(friend.lastLogin).toLocaleString()}`
          : 'Inactivo';

        // Construir URL completa de la foto
        if (friend.profilePicture) {
          friend.profilePicture = `${process.env.BACKEND_URL}/uploads/peoplePic/${friend.profilePicture}`;
        }

        return friend;
      })
      .filter(f => f !== null); // <-- eliminamos nulls

    res.json(friends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const friendship = await Friendship.findOne({
      users: { $all: [userId, friendId] }
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Amistad no encontrada' });
    }

    friendship.isActive = false;
    await friendship.save();

    res.json({ message: 'Amistad eliminada correctamente' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};