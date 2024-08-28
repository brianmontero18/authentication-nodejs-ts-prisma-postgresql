import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, getUserById } from "../services/authService";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { setAuthCookies } from "../utils/cookies";

export const postSignup = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const user = await createUser(email, password, name);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const postSignin = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: "Logged in" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const userIdString = req.params.userId;
  const userId = parseInt(userIdString, 10); // Convertir el string a número

  if (isNaN(userId)) {
    // Si el userId no es un número válido, responder con un error 400 (Bad Request)
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(userId);

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
