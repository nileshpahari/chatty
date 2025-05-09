import "express";

declare module "express" {
  export interface Request {
    user?: {
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      avatar: string;
    };
  }
}