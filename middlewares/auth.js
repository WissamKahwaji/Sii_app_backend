import jwt from 'jsonwebtoken';



const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isCustomAuth = token.length < 500;

        const decodedData = isCustomAuth
            ? jwt.verify(token, process.env.JWT_SECRET_KEY)
            : jwt.decode(token);

        req.userId = decodedData?.id || decodedData?.sub;

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default auth;