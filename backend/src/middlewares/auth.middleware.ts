import jwt from "jsonwebtoken";
import ApiResponse from "../lib/ApiResponse";
import prisma from "../db";
import { NextFunction } from "express";

interface DecodedAccessToken {
  id: string;
}
export const verifyUser = async (req: any, res: any, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      return res.status(401).json(new ApiResponse(401, "unauthorized", ""));
    }
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedAccessToken;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(decoded.id),
      },
      omit: {
        password: true,
        refreshToken: true,
      },
    });
    if (!user) {
      return res.status(401).json(new ApiResponse(401, "unauthorized", ""));
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json(new ApiResponse(401, "unauthorized", ""));
  }
};
