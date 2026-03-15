import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    // Read refresh token from httpOnly cookie
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);

        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const role = user[0].role;
        const status = user[0].status;
        const department = user[0].department;

        const newAccessToken = jwt.sign(
          { userId, name, email, role, status, department },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30s" }
        );

        // Set as httpOnly cookie — frontend does NOT need to handle this value
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          maxAge: 600 * 1000, // 10 minutes, matches AuthController
          secure: false, // Changed to false for HTTP support
          sameSite: "lax",
          path: "/",
        });

        return res.json({ success: true });
      }
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
