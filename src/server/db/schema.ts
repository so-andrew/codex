// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm'
import {
    date,
    integer,
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

// export const posts = createTable(
//   "post",
//   {
//     id: serial("id").primaryKey(),
//     name: varchar("name", { length: 256 }),
//     createdAt: timestamp("created_at", { withTimezone: true })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
//       () => new Date()
//     ),
//   },
//   (example) => ({
//     nameIndex: index("name_idx").on(example.name),
//   })
// );

export const products = createTable('product', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    category: varchar('category', { length: 256 }),
    price: numeric('price').notNull(),
    imageUrl: varchar('imageUrl', { length: 1024 }),
    squareId: varchar('squareId', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
        () => new Date(),
    ),
    creatorId: varchar('creatorId', { length: 256 }).notNull(),
})

export type Product = typeof products.$inferSelect

export const conventions = createTable('convention', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 256 }).notNull(),
    location: varchar('location', { length: 256 }).notNull(),
    startDate: date('startDate').notNull(),
    endDate: date('endDate').notNull(),
    creatorId: varchar('creatorId', { length: 256 }).notNull(),
})

export type Convention = typeof conventions.$inferSelect
