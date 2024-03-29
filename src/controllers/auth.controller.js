// import User from "../models/user.model.js";
import { getConnection } from "../database/connection.js";
import bcrypt from "bcryptjs";
import { createAccesToken } from "../libs/jwt.js";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
    const { email, password, username } = req.body;
    try {
      const pool = await getConnection();
  
      // Consulta para verificar si el usuario ya existe en la base de datos
      const existingUser = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM S_WEB.tb_usuarios WHERE username = @username ");
  
      // Verificar si se encontró un usuario con el mismo nombre de usuario
      if (existingUser.recordset.length > 0) {
        return res.status(400).json( ["El usuario ya existe"] );
      }
  
      // Si el usuario no existe, procedemos con el registro
      const passwordHash = await bcrypt.hash(password, 10);
  
      // Insertar el nuevo usuario en la base de datos
      const newUserResult = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .input("email", sql.NVarChar, email)
        .input("password", sql.NVarChar, passwordHash)
        .query(`
          INSERT INTO S_WEB.tb_usuarios (username, email, password, created_at, updated_at)
          OUTPUT INSERTED.id
          VALUES (@username, @email, @password, GETDATE(), GETDATE())
        `);
  
      // Obtener el ID del usuario recién insertado
      const userId = newUserResult.recordset[0].id;
  
      // Generar un token de acceso para el nuevo usuario con el id como payload
      const token = await createAccesToken({ id: userId });
  
      // Configurar la cookie de token
      res.cookie("token", token, {
        httpOnly: true,
      });
  
      // Enviar respuesta con detalles del usuario registrado
      res.json({
        id: userId,
        username,
        email,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error al registrar el usuario:", error.message);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  export const login = async (req, res) => {
    const { password, username } = req.body;
    try {
        const pool = await getConnection();
        
        // Consulta para buscar el usuario en la base de datos
        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .query("SELECT * FROM S_WEB.tb_usuarios WHERE username = @username");

        const userFound = result.recordset[0]; // Obtener el primer usuario encontrado
        
        // Verificar si se encontró el usuario
        if (!userFound) {
            return res.status(400).json({
                message: "Usuario no encontrado. Por favor, regístrate."
            });
        }
        
        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, userFound.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Contraseña inválida"
            });
        }
        
        // Generar token de acceso
        const token = await createAccesToken({ id: userFound.id });
        
        // Establecer la cookie de token en la respuesta
        res.cookie("token", token );
        
        // Enviar respuesta con detalles del usuario
        res.json({
            id: userFound.id,
            username: userFound.username,
            email: userFound.email,
            created_at: userFound.created_at,
            updated_at: userFound.updated_at
        });
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const logout = async (req,res) => {
    try {
        // Establecer la cookie de token con fecha de caducidad en el pasado
        res.cookie("token", "", {
            expires: new Date(0)
        });

        // Enviar una respuesta exitosa
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error during logout:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const profile = async (req, res) => {
    const userId = req.user.id;
    try {
        const pool = await getConnection();
        
        // Consulta para buscar el usuario en la base de datos
        const result = await pool
            .request()
            .input("userId", sql.Int, userId)
            .query("SELECT * FROM S_WEB.tb_usuarios WHERE id = @userId");

        const userFound = result.recordset[0]; // Obtener el primer usuario encontrado
        
        // Verificar si se encontró el usuario
        if (!userFound) {
            return res.status(400).json({
                message: "User not found"
            });
        }
        
        // Enviar respuesta con detalles del usuario
        res.json({
            id: userFound.id,
            username: userFound.username,
            email: userFound.email,
            created_at: userFound.created_at,
            updated_at: userFound.updated_at
        });
    } catch (error) {
        console.error("Error during profile retrieval:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.send(false);

    jwt.verify(token, TOKEN_SECRET, async (error, user) => {
        if (error) return res.sendStatus(401);
    
        try {
            const pool = await getConnection();
    
            // Consulta para buscar el usuario en la base de datos
            const result = await pool
                .request()
                .input("id",  sql.Int, user.id)
                .query("SELECT * FROM S_WEB.tb_usuarios WHERE id = @id");
    
            const userFound = result.recordset[0]; // Obtener el usuario encontrado
            
            // Verificar si se encontró el usuario
            if (!userFound) return res.sendStatus(401);
    
            // Enviar respuesta con detalles del usuario
            res.json({
                id: userFound.id,
                username: userFound.username,
                email: userFound.email,
            });
        } catch (error) {
            console.error("Error al verificar el token:", error.message);
            res.sendStatus(500);
        }
    });
};
