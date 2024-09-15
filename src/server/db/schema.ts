// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm'
import {
    type AnyPgColumn,
    integer,
    json,
    numeric,
    pgTableCreator,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `codex_${name}`)

// Users
export const users = createTable('users', {
    id: varchar('id', { length: 256 }).primaryKey().notNull(),
})
export type User = typeof users.$inferSelect

// Products
export const products = createTable('product', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    category: integer('category')
        .default(-1)
        .notNull()
        .references(() => productCategories.id, {
            onDelete: 'set default',
        }),
    price: numeric('price'),
    imageUrl: varchar('imageUrl', { length: 1024 }),
    squareId: varchar('squareId', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
        () => new Date(),
    ),
    creatorId: varchar('creatorId', { length: 256 })
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    //variations: json('variations').$type<ProductVariation[]>().default([]),
})
export type Product = typeof products.$inferSelect
export type ProductData = Product & { variations: ProductVariation[] | null }

// export const productsRelations = relations(products, ({ one, many }) => ({
//     creator: one(users, {
//         fields: [products.creatorId],
//         references: [users.id],
//     }),
//     productVariations: many(productVariations),
// }))

// Product variations
export const productVariations = createTable('productVariations', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    baseProductName: varchar('baseProductName', { length: 256 }).notNull(),
    sku: varchar('sku', { length: 25 }).unique(),
    productId: integer('productId')
        .references(() => products.id, { onDelete: 'cascade' })
        .notNull(),
    price: numeric('price').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
        () => new Date(),
    ),
    creatorId: varchar('creatorId', { length: 256 })
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
})
export type ProductVariation = typeof productVariations.$inferSelect

// export const productVariationsRelations = relations(
//     productVariations,
//     ({ one, many }) => ({
//         creator: one(users, {
//             fields: [productVariations.creatorId],
//             references: [users.id],
//         }),
//         conventionSalesFigure: many(conventionProductListings),
//     }),
// )

export const productCategories = createTable('productCategories', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    creatorId: varchar('creatorId', { length: 256 })
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    parentId: integer('parentId').references(
        (): AnyPgColumn => productCategories.id,
        {
            onDelete: 'cascade',
        },
    ),
})
export type Category = typeof productCategories.$inferSelect

// Conventions
export const conventions = createTable('convention', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    location: varchar('location', { length: 256 }).notNull(),
    length: integer('length').default(1).notNull(),
    startDate: timestamp('startDate', {
        mode: 'date',
        withTimezone: true,
    }).notNull(),
    endDate: timestamp('endDate', {
        mode: 'date',
        withTimezone: true,
    }).notNull(),
    creatorId: varchar('creatorId', { length: 256 })
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
})
export type Convention = typeof conventions.$inferSelect

// export const conventionsRelations = relations(conventions, ({ one, many }) => ({
//     creator: one(users, {
//         fields: [conventions.creatorId],
//         references: [users.id],
//     }),
//     conventionProductListings: many(conventionProductListings),
// }))

// Convention product listings
// export const conventionProductReports = createTable(
//     'conventionProductReports',
//     {
//         id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//         name: varchar('name', { length: 256 }).notNull(),
//         category: varchar('category', { length: 256 }),
//         price: numeric('price'),
//         length: lengthEnum('length').notNull(),
//         cashSales: integer('cashSales')
//             .array()
//             .default(sql`'{}'::integer[]`),
//         cardSales: integer('cardSales')
//             .array()
//             .default(sql`'{}'::integer[]`),
//         createdAt: timestamp('created_at', { withTimezone: true })
//             .default(sql`CURRENT_TIMESTAMP`)
//             .notNull(),
//         updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
//             () => new Date(),
//         ),
//         creatorId: varchar('creatorId', { length: 256 })
//             .references(() => users.id, { onDelete: 'cascade' })
//             .notNull(),
//         productId: integer('productId')
//             .references(() => products.id)
//             .notNull(),
//         productVariationId: integer('productVariationId').references(
//             () => productVariations.id,
//         ),
//         conventionId: integer('conventionId')
//             .references(() => conventions.id, { onDelete: 'cascade' })
//             .notNull(),
//     },
// )
// export type ConventionProductReport =
//     typeof conventionProductReports.$inferSelect

// export const conventionProductListingsRelations = relations(
//     conventionProductListings,
//     ({ one }) => ({
//         creator: one(users, {
//             fields: [conventionProductListings.creatorId],
//             references: [users.id],
//         }),
//         convention: one(conventions, {
//             fields: [conventionProductListings.conventionId],
//             references: [conventions.id],
//         }),
//         product: one(products, {
//             fields: [conventionProductListings.productId],
//             references: [products.id],
//         }),
//         productVariation: one(productVariations, {
//             fields: [conventionProductListings.productVariationId],
//             references: [productVariations.id],
//         }),
//     }),
// )

export type salesFigures = Record<string, salesFigureDaily>

export type salesFigureDaily = {
    date: Date
    cashSales: number
    cardSales: number
}

export const conventionProductVariationReports = createTable(
    'conventionProductVariationReports',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        name: varchar('name', { length: 256 }).notNull(),
        productId: integer('productId')
            .references(() => products.id, { onDelete: 'set default' })
            .default(-1)
            .notNull(),
        productName: varchar('productName', { length: 256 }).notNull(),
        price: numeric('price').notNull(),
        salesFigures: json('salesFigures').$type<salesFigures>(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
            () => new Date(),
        ),
        creatorId: varchar('creatorId', { length: 256 })
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        productVariationId: integer('productVariationId')
            .references(() => productVariations.id, { onDelete: 'set default' })
            .default(-1)
            .notNull(),
        conventionId: integer('conventionId')
            .references(() => conventions.id, { onDelete: 'cascade' })
            .notNull(),
    },
)
export type ConventionProductVariationReport =
    typeof conventionProductVariationReports.$inferSelect

// export const conventionProductVariationListingsRelations = relations(
//     conventionProductVariationListings,
//     ({ one }) => ({
//         creator: one(users, {
//             fields: [conventionProductVariationListings.creatorId],
//             references: [users.id],
//         }),
//         convention: one(conventions, {
//             fields: [conventionProductVariationListings.conventionId],
//             references: [conventions.id],
//         }),
//         conventionProductListing: one(conventionProductListings, {
//             fields: [
//                 conventionProductVariationListings.conventionProductListingId,
//             ],
//             references: [conventionProductListings.id],
//         }),
//         productVariation: one(productVariations, {
//             fields: [conventionProductVariationListings.productVariationId],
//             references: [productVariations.id],
//         }),
//     }),
// )
