import logger from "#config/logger.js";
import { signupSchema, signinSchema } from "#validations/auth.validation.js";
import { formatValidationError } from "#utils/format.js";
import { createUser, authenticateUser } from "#services/auth.service.js";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";

export const signup = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                details: 'Request body is required'
            }); 
        }

        const validationResult = signupSchema.safeParse(req.body);
        if(!validationResult.success)
        {
            return res.status(400).json({
                error: 'Validation error',
                details: formatValidationError(validationResult.error)
            });
        }

        const {name,email,password,role} = validationResult.data;

        const user = await createUser({name,email,password,role});

        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role});
        cookies.set(res,'token', token);

        logger.info(`User registered successfully, ${email}`);
        res.status(201).json({
            message: 'User registered',
            user: {
                id:user.id, name:user.name, email:user.email, role:user.role
            }
        });

    } catch (e)
    {
        logger.error('Signup error',e);
        if (e.message === 'User with this email already exists')
        {
            return res.status(400).json({error: 'Email already exists'});
        }
        next(e);
    }

};

export const signin = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                details: 'Request body is required'
            });
        }

        const validationResult = signinSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation error',
                details: formatValidationError(validationResult.error)
            });
        }

        const { email, password } = validationResult.data;

        const user = await authenticateUser({ email, password });

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res, 'token', token);

        logger.info(`User signed in successfully, ${email}`);
        res.status(200).json({
            message: 'User signed in',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (e) {
        logger.error('Signin error', e);
        if (e.message === 'Invalid email or password') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        next(e);
    }
};

export const signout = async (req, res, next) => {
    try {
        const token = cookies.get(req, 'token');
        
        if (token) {
            try {
                const decoded = jwttoken.verify(token);
                logger.info(`User signed out successfully, ${decoded.email}`);
            } catch (tokenError) {
                logger.info('User signed out (invalid token)');
            }
        } else {
            logger.info('User signed out (no token)');
        }

        cookies.clear(res, 'token');
        
        res.status(200).json({
            message: 'User signed out successfully'
        });

    } catch (e) {
        logger.error('Signout error', e);
        next(e);
    }
};

export default { signup, signin, signout };
