import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    const { id } = idValidation.data;
    logger.info(`Getting user by id: ${id}`);

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error getting user by id', e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Request body is required',
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Users can only update their own information (unless admin)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change roles
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user: ${id}`);

    const updatedUser = await updateUserService(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user', e);
    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    const { id } = idValidation.data;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Only admins or the user themselves can delete
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(`Deleting user: ${id}`);

    await deleteUserService(id);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error('Error deleting user', e);
    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    next(e);
  }
};
