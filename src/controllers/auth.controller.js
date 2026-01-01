import logger from "#config/logger.js";
import {signupSchema, signinSchema} from "#validations/auth.validation.js";
import {formatValidationError} from "#utils/format.js";
import {createUser, authenticateUser} from "#services/auth.service.js";
import {jwtToken} from "#utils/jwt.js";
import {cookies} from "#utils/cookies.js";

export const signup = async (req, res, next) => {
    try {
        const validationResult = signupSchema.safeParse(req.body)
        if (!validationResult.success) return res.status(400).json({
            error: "Validation failed",
            details: formatValidationError(validationResult.error)
        })

        const {name, email, password, role} = validationResult.data;

        // Auth service
        const user = await createUser({ name, email, password, role})

        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role
        })

        cookies.set(res, 'token', token)

        logger.info(`User registered successfully ${email}`)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        logger.error('Signup error',error)
        if (error.message === 'User already exists') return res.status(409).json({
            error: error.message
        })
        next(error)
    }
}

export const signin = async (req, res, next) => {
    try {
        const validationResult = signinSchema.safeParse(req.body)
        if (!validationResult.success) return res.status(400).json({
            error: "Validation failed",
            details: formatValidationError(validationResult.error)
        })

        const {email, password} = validationResult.data;

        // Auth service
        const user = await authenticateUser({ email, password })

        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role
        })

        cookies.set(res, 'token', token)

        logger.info(`User signed in successfully ${email}`)
        res.status(200).json({
            message: 'User signed in successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        logger.error('Signin error', error)
        if (error.message === 'User not found' || error.message === 'Invalid password') {
            return res.status(401).json({
                error: 'Invalid credentials'
            })
        }
        next(error)
    }
}

export const signout = async (req, res, next) => {
    try {
        cookies.clear(res, 'token')

        logger.info('User signed out successfully')
        res.status(200).json({
            message: 'User signed out successfully'
        })
    } catch (error) {
        logger.error('Signout error', error)
        next(error)
    }
}
