import bcrypt from "bcryptjs";
import prisma from "../db";
import { Request, Response } from "express";
import generateToken from "../lib/generateToken";
import ApiResponse from "../lib/ApiResponse";
import { cloudinaryUpload } from "../lib/services/cloudinary.service";

// interface Request extends Request {
//   user: {
//     id: number;
//     username: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     avatar: string;
//   };
// }

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json(new ApiResponse(400, "please give all the required details", ""));
        return 
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(401).json(new ApiResponse(401, "user doesnt exists", ""));
      return;
    }
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      res.status(401).json(new ApiResponse(401, "incorrect password", ""));
    }

    const tokens = await generateToken(user.id);
    if (!tokens) {
      res
        .status(500)
        .json(new ApiResponse(500, "failed to generate tokens", ""));
      return;
    }
    const { accessToken, refreshToken } = tokens;
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: user.id,
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
    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json(new ApiResponse(200, "user logged in successfulyl", loggedInUser));
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
  const { username, email, password, firstName, lastName } = req.body;
  if (!username || !email || !password || !firstName || !lastName) {
    res
      .status(400)
      .json(new ApiResponse(400, "please provide all the required fields", ""));
  }
  if (password.length < 8) {
    res.status(400).json(new ApiResponse(400, "too short password", ""));
  }
  const prevUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (prevUser) {
    res
      .status(401)
      .json(new ApiResponse(400, "user with email already exists", ""));
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  let avatar = null;
  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    avatar = await cloudinaryUpload(avatarLocalPath);
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hash,
      firstName,
      lastName,
      email,
      avatar: null,
    },
  });
  if (!newUser) {
    res
      .status(500)
      .json(new ApiResponse(500, "error while creating the user", ""));
  }
  res.status(200).json(
    new ApiResponse(200, "user created successfully", {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      avatar: newUser.avatar,
    })
  );
};

const logout = async (req: Request, res: Response) => {
  console.log(req.user);
  await prisma.user.update({
    where: { id: req.user?.id },
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

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "user logged out successfully", {}));
};

const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const { newPassword, oldPassword } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      id: req.user?.id,
    },
  });
  if (!user) {
    res.status(401).json(new ApiResponse(401, "user not found", ""));
    return;
  }
  const isCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isCorrect) {
    res.status(401).json(new ApiResponse(401, "incorrect password", ""));
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: {
      id: req.user?.id,
    },
    data: {
      password: hash,
    },
  });
  res.json(new ApiResponse(200, "password updated successfully", {}));
};

const updateDetails = async (req: Request, res: Response) => {
  const { email, firstName, lastName, avatar } = req.body;

  const prevEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (prevEmail) {
    res
      .status(401)
      .json(new ApiResponse(401, "user with email already exists", ""));
  }
  const newUser = await prisma.user.update({
    where: {
      id: req.user?.id,
    },
    data: {
      email,
      firstName,
      lastName,
      avatar,
    },
  });
  res.status(200).json(new ApiResponse(200, "user updated successfully", newUser));
};

const currentUser = async (req: Request, res: Response) => {
  res
    .status(200)
    .json(new ApiResponse(200, "user details fetched successfully", req.user));
};

export { login, signup, logout, updatePassword, updateDetails, currentUser };
