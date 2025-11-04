import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req ,res) => {
    const { username, email, password } = req.body;

  if (!username || !email || !password)
    throw new ApiError(400, "All fields are required");

  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new ApiError(409, "User already exists");

  const user = await User.create({ username, email, password });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefershToken();

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .status(201)
    .json({ message: "User registered successfully", user });
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.provider === "google")
    throw new ApiError(400, "Please login using Google");

  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) throw new ApiError(401, "Invalid password");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefershToken();

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .json({ message: "Login successful", user });
});

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body; // frontend sends Google ID token

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email, name, sub: googleId } = ticket.getPayload();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      username: name,
      email,
      googleId,
      provider: "google"
    });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefershToken();

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .json({ message: "Google login successful", user });
});

const refershAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefershToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .cookie("accessToken", newAccessToken, { httpOnly: true })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true })
      .json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Refresh token invalid or expired" });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out successfully" });
});

const changeCurrentPassword = asyncHandler( async (req,res) => {
    const {oldPassword,newPassowrd} = req.body

    const userId = req.user?._id

    const user = await User.findById(userId)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid password")
    }

    user.password = newPassowrd
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json( new ApiResponse(200,{},"Password changed sucessfully"))
})

const getCurrentUser = asyncHandler (async(req,res,) => {
    return res.status(200)
    .json(new ApiResponse(200,req.user,"current user fetched sucessfully"))
})

export {registerUser,loginUser,logoutUser,googleLogin,changeCurrentPassword,getCurrentUser,refershAccessToken}




