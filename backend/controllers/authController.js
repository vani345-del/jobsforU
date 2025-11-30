import genToken from "../config/token.js";
import User from "../models/User.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js"; 
import crypto from 'crypto'; 
import passport from 'passport'; 
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'; 
import cloudinary from '../config/cloudinary.js';



passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['r_liteprofile', 'r_emailaddress'], 
    state: true, 
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const linkedInId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar = profile.photos[0]?.value;

        
        let user = await User.findOne({ linkedInId });

        if (user) {
           
            return done(null, user);
        }

      
        user = await User.findOne({ email });

        if (user) {
           
            user.linkedInId = linkedInId;
            user.isVerified = true; 
            await user.save();
            return done(null, user);
        }

       
        const newUser = await User.create({
            name,
            email,
            avatar,
            linkedInId,
            isVerified: true, 
        });

        return done(null, newUser);
    } catch (error) {
        return done(error, false);
    }
}));





export const linkedInCallback = (req, res) => {
  
    if (req.user) {
        
        const token = genToken(req.user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        
        res.redirect("http://localhost:5173/profile");
    } else {
      
        res.redirect("http://localhost:5173/login?error=LinkedInAuthFailed");
    }
};











export const signup = async(req, res) => {
    try {
        const {name,email,password, } = req.body;
        let existUser=await User.findOne({email});
        
        if(existUser){
            return res.status(400).json({message:"User already exist"});
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({message:"Enter a valid email"});
        }
        if(password.length<8){
            return res.status(400).json({message:"Password must be at least 8 characters long"});
        }
        
        let hashPassword=await bcrypt.hash(password,10);
        
       
        const user=await User.create({
            name,
            email,
            password:hashPassword,
            isVerified: false,
        });

       
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const hashedOtp = await bcrypt.hash(otp, 10);
        
        user.verificationOtp = hashedOtp;
        user.verificationOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await user.save();
        
       
       await sendEmail({
            to: email,
            subject: 'Account Verification Code: Your 6-Digit OTP', // Explicit subject
            text: `Hello ${name},\n\nYour One-Time Passcode (OTP) for verification is: ${otp}. This code expires in 10 minutes. Please enter it on the verification screen.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                    <h2>Email Verification Required</h2>
                    <p>Hello ${name}, thank you for signing up!</p>
                    <p>To verify your account, please use the following 6-digit code:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #4f46e5; padding: 10px 20px; border: 2px solid #4f46e5; border-radius: 5px; letter-spacing: 5px; display: inline-block;">
                            ${otp}
                        </span>
                        
                        <span style="font-size: 24px; color: #4f46e5; margin-left: 10px; cursor: copy;" title="Copy this code">
                            &#x2398; 
                            </span>
                    </div>
                    
                    <p style="font-size: 12px; color: #777;">This code is valid for 10 minutes.</p>
                </div>
            `,
        });

        
        return res.status(202).json({
            user,
            message: "User created. OTP sent for verification."
        });
    }
    catch (error) {
        console.error("Signup failed:", error); 
        return res.status(500).json({message:`Sign up error: User created, but failed to send verification email.`});
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

      
        if (user.verificationOtpExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired. Please sign up again.' });
        }

       
        const isOtpValid = await bcrypt.compare(otp.toString(), user.verificationOtp);
        
        if (!isOtpValid) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        user.isVerified = true;
        user.verificationOtp = undefined;
        user.verificationOtpExpires = undefined;
        await user.save();

      
        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
           sameSite:"Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `OTP Verification Error: ${error.message}` });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }




        if (!user.isVerified) {
         
             
           
             const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
             const hashedOtp = await bcrypt.hash(otp, 10);
             
             user.verificationOtp = hashedOtp;
             user.verificationOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
             await user.save();

            await sendEmail({
                to: email,
                subject: 'Account Verification Code: Your New 6-Digit OTP',
                text: `Hello ${user.name},\n\nYour new One-Time Passcode (OTP) for verification is: ${otp}. This code expires in 10 minutes. Please enter it on the verification screen.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                        <h2>Account Verification Required</h2>
                        <p>Hello ${user.name}, you are trying to log in but your account is not yet verified. A new code has been generated.</p>
                        <p>Please use the following 6-digit code:</p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #4f46e5; padding: 10px 20px; border: 2px solid #4f46e5; border-radius: 5px; letter-spacing: 5px; display: inline-block;">
                                ${otp}
                            </span>
                             <span style="font-size: 24px; color: #4f46e5; margin-left: 10px; cursor: copy;" title="Copy this code">
                                &#x2398; 
                            </span>
                        </div>
                        
                        <p style="font-size: 12px; color: #777;">This code is valid for 10 minutes.</p>
                    </div>
                `,
             });
             // 3. Return 202 status to tell the frontend to redirect
             return res.status(202).json({ 
                message: 'Account not verified. A new verification code has been sent to your email.', 
                email: user.email // Send email back for frontend redirect
             });
        }
        
        let token=await genToken(user._id);
        res.cookie("token",token,{
            httpOnly:true,
         secure:process.env.NODE_ENV === "production",
            sameSite:"Lax",
            maxAge:7*24*60*60*1000,
        });
        return res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Login Error ${error}` });
    }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
       secure:process.env.NODE_ENV === "production",
    sameSite:"Lax",
      path: "/",       
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error ${error}` });
  }
};




export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      const token = await genToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
       secure:process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password: _, ...userData } = user.toObject();
      return res.status(200).json(userData);
    }

    const randomPassword =
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-10);

    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true, 
    });

    const token = await genToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure:process.env.NODE_ENV === "production",
    sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = newUser.toObject();
    return res.status(201).json(userData);

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: error.message });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    

    if (!user) {
      return res.status(200).json({ message: 'If a matching account was found, a reset email has been sent.' });
    }
    
 
    if (!user.isVerified) {
        return res.status(400).json({ message: 'Account must be verified to reset password.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
      html: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset My Password
        </a>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("PASSWORD RECEIVED IN RESET API:", password);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired.",
      });
    }

    if (!password || password.trim() === "") {
      return res.status(400).json({ message: "Password cannot be empty." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

  
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      }
    );

    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      text: `Hello ${user.name}, your password was changed.`,
      html: `<h1>Password Changed</h1><p>Your password has been updated successfully.</p>`,
    });

    return res.status(200).json({ message: "Password has been successfully reset." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
    try {
        
        const userId = req.userId; 
        const { name } = req.body;
        const file = req.file; 

       
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

       
        let avatarUrl = user.avatar; 

        if (file) {
          
            const result = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                { 
                    folder: "mern-auth-avatars",
                    transformation: [{ width: 150, height: 150, crop: "fill" }]
                }
            );
            avatarUrl = result.secure_url;
        }

        
        if (name) {
            user.name = name;
        }
        user.avatar = avatarUrl;
        
        await user.save();

        
        const { password: _, ...userData } = user.toObject();
        res.status(200).json(userData);

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: `Profile update failed: ${error.message}` });
    }
};


