import prisma from "../db";
import ApiError from "./ApiError";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: number;
  username: string;
  email: string;
}
const generateAccessToken = function (user: UserPayload) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};
const generateRefreshToken = function (user: UserPayload) {
  return jwt.sign(
    {
      _id: user.id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "25d",
    }
  );
};

export default async function generateToken(
  userId: number
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    if (!user) {
      throw new ApiError(400, "Invalid User Id", []);
    }
    const accessToken: string = generateAccessToken(user);
    const refreshToken: string = generateRefreshToken(user);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return null;
  }
}
