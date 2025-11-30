// config/token.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const genToken = (userId) => { 
    try {
       
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return token;
    } catch (error) {
        console.error("Token generation error:", error); 
      
        throw new Error("Could not generate token."); 
    }
}
export default genToken;