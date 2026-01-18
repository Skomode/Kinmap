import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;


    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }

    // Verificar si el correo ya está registrado
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Verificar si el teléfono ya está registrado
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'El número de teléfono ya está registrado' });
      }
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });
    await newUser.save();

    // Crear token JWT con todos los campos del usuario (excepto password)
    const token = jwt.sign(
      {
        userId: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        isActive: newUser.isActive,
        lastLogin: newUser.lastLogin,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'Usuario registrado correctamente', 
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario por email o teléfono
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { phone: email } 
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Actualizar lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Crear token JWT con todos los campos del usuario (excepto password)
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login exitoso', 
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Verificar token (mantenido sin cambios, pero podría usarse si es necesario)
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ 
      valid: true, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Recuperación de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es obligatorio' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Token de reset:', resetToken);

    res.status(200).json({ 
      message: 'Se ha enviado un enlace de recuperación a tu email',
      resetToken // Solo para desarrollo
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Restablecer contraseña (sin cambios)
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset password:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expirado' });
    }
    res.status(500).json({ error: 'Error del servidor' });
  }
};