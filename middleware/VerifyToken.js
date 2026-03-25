import jwt from "jsonwebtoken";

export const VerifyToken = (req, res, next) => {
  // Read from cookie first, fallback to Authorization header
  const token =
    req.cookies.accessToken ||
    (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(401);
    req.email = decoded.email;
    req.alldata = decoded;
    next();
  });
};

export const VerifyRefreshToken = (req, res, next) => {
  // Read from cookie first, fallback to request body
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(401);
    req.email = decoded.email;
    req.alldata = decoded;
    next();
  });
};

export const adminOnly = (req, res, next) => {
  if (!req.alldata || req.alldata.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

