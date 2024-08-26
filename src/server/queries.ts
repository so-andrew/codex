import { auth } from "@clerk/nextjs/server"
import "server-only"
import { db } from "./db";

export async function getUserProducts() {
    const user = auth();
    if(!user.userId) throw new Error("Unauthorized")

    const products = await db.query.products.findMany({
        where: (model, { eq }) => eq(model.creatorId, user.userId),
        orderBy: (model, { asc }) => asc(model.name)
    })
    return products
}

export async function getUserConventions() {
    const user = auth();
    if(!user.userId) throw new Error("Unauthorized")

    const conventions = await db.query.conventions.findMany({
        where: (model, { eq }) => eq(model.creatorId, user.userId),
        orderBy: (model, { asc }) => asc(model.name)
    })
    return conventions
}