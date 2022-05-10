import type { Forms } from "./types.server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";

export const createUser = async (user: Forms) => {
  const passwordHash = await bcrypt.hash(user.password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: user.username,
      password: passwordHash,
    },
  });
  return { id: newUser.id, username: newUser.username };
};
