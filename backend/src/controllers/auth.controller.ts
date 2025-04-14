import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import prisma from "../db";
import { Request, Response, NextFunction } from "express";
import ApiError from "../lib/ApiError";
import generateToken from "../lib/generateToken";
import ApiResponse from "../lib/ApiResponse";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};
const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, "please give all the required details", ""));
    }
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, "user doesnt exists", ""));
    }
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res
        .status(401)
        .json(new ApiResponse(401, "incorrect password", ""));
    }

    const { accessToken, refreshToken } = generateToken(user.id);
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      omit: {
        password,
        refreshToken,
      },
    });
    res
      .status(200)
      .json(new ApiResponse(200, "user logged in successfulyl", loggedInUser))
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "failed to login user... internal server error",
          ""
        )
      );
  }
};

const signup = async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName, avatar } = req.body;
  if (!username || !email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .json(new ApiResponse(400, "please provide all the required fields", ""));
  }
  if (password.length < 8) {
    return res.status(400).json(new ApiResponse(400, "too short password", ""));
  }
  const prevUser = await prisma.user.findUnique({
    where: {
      email,
      username,
    },
  });

  if (prevUser) {
    return res
      .status(401)
      .json(new ApiResponse(400, "user with email already exists", ""));
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const { refreshToken } = generateToken();
  const newUser = await prisma.user.create({
    data: {
      username,
      password: hash,
      firstName,
      lastName,
      email,
      avatar,
      refreshToken,
    },
  });
  if (!newUser) {
    return res
      .status(500)
      .json(new ApiResponse(500, "error while creating the user", ""));
  }
};

const logout = async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      refreshToken: {
        set: null,
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  });

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "user logged out successfully", {}));
};


const updatePassword = async (req: Request, res: Response) => {
  const { newPassword, oldPassword } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });
  const isCorrect = bcrypt.compare(oldPassword, user.password);

  if (!isCorrect) {
    return res.status(401).json(new ApiResponse(401, "incorrect password", ""));
  }

  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      password: newPassword,
    },
  });
  return res.json(new ApiResponse(200, "password updated successfully", {}));
};

const updateDetails = async (req: Request, res: Response) => {
  const { email, firstName, lastName, avatar } = req.body;

  const prevEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (prevEmail) {
    return res
      .status(401)
      .json(new ApiResponse(401, "user with email already exists", ""));
  }
  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      email,
      firstName,
      lastName,
      avatar,
    },
  });
};

export { login, signup, logout, updatePassword, updateDetails };
