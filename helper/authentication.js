const { tokenToPayload } = require("./bcryptjwt")
const { User } = require("../models/index")

const authentication = async (req, res, next) => {
  try {
    const { access_token } = req.headers
    if (!access_token) {
      res.status(401).json({ message: "Invalid token" })
    } else {
      const payload = tokenToPayload(access_token)
      const user = await User.findByPk(payload.id)
      if (!user) {
        res.status(401).json({ message: "Invalid token" })
      } else {
        req.loginUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
        next()
      }
    }
  }
  catch (err) {
    if (err.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" })
    } else {
      res.status(500).json({ message: "Internal server error" })
    }
  }
}

module.exports = authentication