
import jwt from "jsonwebtoken";

export const auth = (req:any, res:any, next:any) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({error: "No token"});

  try {
    const decoded:any = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({error: "Invalid token"});
  }
};
