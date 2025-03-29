import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default async function dbConnect() {
  await prisma.$connect();
  console.log("connected to db\n");
}
