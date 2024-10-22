// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, type SQL, sql } from 'drizzle-orm'
import {
    type AnyPgColumn,
    boolean,
    integer,
    numeric,
    pgTableCreator,
    primaryKey,
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
})
export type Product = typeof products.$inferSelect
export type ProductData = Product & { variations: ProductVariation[] | null }

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

export const discounts = createTable('discounts', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    amount: numeric('amount').notNull(),
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
export type Discount = typeof discounts.$inferSelect

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
    protectEdits: boolean('protectEdits').default(false).notNull(),
})
export type Convention = typeof conventions.$inferSelect

export type salesFigures = Record<string, salesFigureDaily>
export type salesFigureDaily = {
    date: Date
    cashSales: number
    cardSales: number
}

export const conventionProductReports = createTable(
    'conventionProductReports',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        name: varchar('name', { length: 256 }).notNull(),
        productId: integer('productId').references(() => products.id, {
            onDelete: 'set null',
        }),
        originalProductId: integer('originalProductId'),
        productName: varchar('productName', { length: 256 }).notNull(),
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
        productVariationId: integer('productVariationId').references(
            () => productVariations.id,
            { onDelete: 'set null' },
        ),
        categoryId: integer('categoryId')
            .default(-1)
            .notNull()
            .references(() => productCategories.id, {
                onDelete: 'set default',
            }),
        categoryName: varchar('categoryName').default('Uncategorized'),
        conventionId: integer('conventionId')
            .references(() => conventions.id, { onDelete: 'cascade' })
            .notNull(),
        custom: boolean('custom').default(false).notNull(),
        deleted: boolean('deleted').generatedAlwaysAs(
            (): SQL =>
                sql`${conventionProductReports.productId} IS NULL AND ${conventionProductReports.originalProductId} IS NOT NULL`,
        ),
    },
)
export type ConventionProductReport =
    typeof conventionProductReports.$inferSelect

export const reportRelations = relations(
    conventionProductReports,
    ({ many }) => ({
        revenues: many(productDailyRevenue),
    }),
)

export const productDailyRevenue = createTable(
    'productDailyRevenue',
    {
        reportId: integer('reportId')
            .references(() => conventionProductReports.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        conventionId: integer('conventionId')
            .references(() => conventions.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        categoryId: integer('categoryId')
            .default(-1)
            .notNull()
            .references(() => productCategories.id, {
                onDelete: 'set default',
            }),
        date: timestamp('date', {
            mode: 'date',
            withTimezone: true,
        }).notNull(),
        cashSales: integer('cashSales').default(0).notNull(),
        cardSales: integer('cardSales').default(0).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.reportId, table.date] }),
        }
    },
)

export const revenueRelations = relations(productDailyRevenue, ({ one }) => ({
    revenue: one(conventionProductReports, {
        fields: [productDailyRevenue.reportId],
        references: [conventionProductReports.id],
    }),
}))

export const conventionDiscountReports = createTable(
    'conventionDiscountReports',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        name: varchar('name', { length: 256 }).notNull(),
        discountId: integer('discountId').references(() => discounts.id, {
            onDelete: 'set null',
        }),
        amount: numeric('amount').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
            () => new Date(),
        ),
        creatorId: varchar('creatorId', { length: 256 })
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        conventionId: integer('conventionId')
            .references(() => conventions.id, { onDelete: 'cascade' })
            .notNull(),
        custom: boolean('custom').default(false).notNull(),
    },
)

export type ConventionDiscountReport =
    typeof conventionDiscountReports.$inferSelect

export const discountRelations = relations(
    conventionDiscountReports,
    ({ many }) => ({
        daily: many(discountDaily),
    }),
)

export const discountDaily = createTable(
    'discountDaily',
    {
        reportId: integer('reportId')
            .references(() => conventionDiscountReports.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        conventionId: integer('conventionId')
            .references(() => conventions.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        date: timestamp('date', { mode: 'date', withTimezone: true }).notNull(),
        cashDiscounts: integer('cashDiscounts').default(0).notNull(),
        cardDiscounts: integer('cardDiscounts').default(0).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.reportId, table.date] }),
        }
    },
)

export type DiscountDaily = typeof discountDaily.$inferInsert

export const discountDailyRelations = relations(discountDaily, ({ one }) => ({
    daily: one(conventionDiscountReports, {
        fields: [discountDaily.reportId],
        references: [conventionDiscountReports.id],
    }),
}))
