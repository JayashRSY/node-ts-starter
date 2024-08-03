import jwt from 'jsonwebtoken';

export const createTokens = (validUser: any) => {
    const accessToken = jwt.sign(
        {
            _id: validUser._id,
            email: validUser.email,
            name: validUser.name,
            role: validUser.role,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXP_TIME });

    const refreshToken = jwt.sign(
        { "email": validUser.email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXP_TIME }
    )
    return { accessToken, refreshToken }
}