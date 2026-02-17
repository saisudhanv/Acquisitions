import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from '#services/auth.service.js';

export const getAllUsers = async () => {
    try {
        return await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        }).from(users);

        
    } catch (e) {
        logger.error('Error getting users', e);
        throw e;
    }
}

export const getUserById = async (id) => {
    try {
        const [user] = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        }).from(users).where(eq(users.id, id)).limit(1);

        return user || null;
    } catch (e) {
        logger.error('Error getting user by id', e);
        throw e;
    }
}

export const updateUser = async (id, updates) => {
    try {
        const existingUser = await getUserById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        const updateData = { ...updates, updated_at: new Date() };

        if (updates.password) {
            updateData.password = await hashPassword(updates.password);
        }

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            });

        logger.info(`User ${id} updated successfully`);
        return updatedUser;
    } catch (e) {
        logger.error('Error updating user', e);
        throw e;
    }
}

export const deleteUser = async (id) => {
    try {
        const existingUser = await getUserById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        await db.delete(users).where(eq(users.id, id));

        logger.info(`User ${id} deleted successfully`);
        return { message: 'User deleted successfully' };
    } catch (e) {
        logger.error('Error deleting user', e);
        throw e;
    }
}
