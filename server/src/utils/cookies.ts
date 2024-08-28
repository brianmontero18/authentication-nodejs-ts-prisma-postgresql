import { Response } from "express";

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
};
