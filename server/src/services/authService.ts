import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient";

export const createUser = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  return user;
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const getUserById = async (userId: number) => {
  return prisma.user.findUnique({ where: { id: userId } });
};
