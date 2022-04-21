require('dotenv').config();

const express = require('express')
const cors = require('cors')

const { User } = require('./models/index')

const { payloadToToken, comparePassword } = require('./helper/bcryptjwt')

const authentication = require('./helper/authentication')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body
    const user = await User.findOne({ where: { email } })
    if (user) {
      throw ({ name: 'BadRequest' })
    }
    if (!email) {
      res.status(400).json({ message: "Email is required" })
    } else if (!password) {
      res.status(400).json({ message: "Password is required" })
    } else {
      const result = await User.create({ email, password, first_name, last_name, role })
      res.status(201).json({
        id: result.id,
        email: result.email
      })
    }
  }
  catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({ message: "Email must be unique" })
    } else if (err.name === "BadRequest") {
      res.status(400).json({ message: "Email must be unique" })
    } else {
      res.status(500).json({ message: "Internal server error" })
    }
  }
})

app.get('/api/users', authentication, async (req, res) => {
  try {
    const user = await User.findAll()
    let data = []
    for (let el of user) {
      data.push({ id: el.id, email: el.email, first_name: el.first_name, last_name: el.last_name, role: el.role })
    }
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get('/api/users/current', authentication, async (req, res) => {
  try {
    const UserId = req.loginUser.id
    const user = await User.findByPk(UserId)
    if (!user) {
      throw ({ name: 'notFound' })
    }
    res.status(200).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role })
  } catch (err) {
    if (err.name === "notFound") {
      res.status(404).json({ message: "User Not Found" })
    } else {
      console.log(err)
      res.status(500).json({ message: "Internal server error" })
    }
  }
})

app.get('/api/users/:id', authentication, async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) {
      throw ({ name: 'notFound' })
    }
    res.status(200).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role })
  } catch (err) {
    if (err.name === "notFound") {
      res.status(404).json({ message: "User Not Found" })
    } else {
      res.status(500).json({ message: "Internal server error" })
    }
  }
})

app.delete('/api/users/:id', authentication, async (req, res) => {
  const { role } = req.loginUser
  if (role === 'admin') {
    const { id } = req.params
    const user = await User.findByPk(id)
    const result = await User.destroy({
      where: {
        id
      },
      returning: true
    })
    if (user) res.status(200).json({ message: "delete user succesfull" })
    else {
      res.status(404).json({ message: "User Not Found" })
    }
  } else {
    res.status(403).json({ message: "You are not authorized" })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email) {
      res.status(400).json({ message: "Email is required" })
    } else if (!password) {
      res.status(400).json({ message: "Password is required" })
    } else {
      const user = await User.findOne({ where: { email } })
      if (user) {
        if (comparePassword(password, user.password)) {
          const payload = {
            id: user.id,
            email: user.email,
            name: user.name
          }
          const accessToken = payloadToToken(payload)
          res.status(200).json({ access_token: accessToken })
        } else {
          res.status(401).json({ message: "Invalid email/password" })
        }
      } else {
        res.status(401).json({ message: "Invalid email/password" })
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.listen(3000, (req, res) => {
  console.log('listen');
})