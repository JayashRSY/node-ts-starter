interface CookieOptions {
    httpOnly: boolean;
    maxAge: number;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
}

const cookieConfig: CookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
};

export default cookieConfig;