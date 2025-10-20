import { relations } from "drizzle-orm/relations";
import { users, ebooks } from "./schema";

export const ebooksRelations = relations(ebooks, ({one}) => ({
	user: one(users, {
		fields: [ebooks.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	ebooks: many(ebooks),
}));