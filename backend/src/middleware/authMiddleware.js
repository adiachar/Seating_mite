import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if(!token) {
        return res.status(401).json({message: "Unauthorized!"});
    }
    try {
        const actualToken = token.split(' ')[1];
        const decoded = jwt.verify(actualToken, process.env.SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        return res.status(401).json({message: "Unauthorized!"});
    }
}