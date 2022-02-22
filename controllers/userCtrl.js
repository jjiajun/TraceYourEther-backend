const BaseController = require("./baseCtrl");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController extends BaseController {
  constructor(model, salt) {
    super(model, salt);
  }

  /** For testing purposes, but decided to leave it here in case we need such a route */
  async getAllUsersData(req, res) {
    const allUserData = await this.model.find();
    if (!allUserData) {
      res.send("No data");
    }
    res.send({ allUserData });
  }

  /** get user profile data by id
   * @param {number} id
   */
  async getUserProfileById(req, res) {
    const { id } = req.body;
    const userProfile = await this.model.findOne({ _id: id });
    if (!userProfile) {
      res.send("No data");
    }
    res.send({ userProfile });
  }

  /** Returns a token and the userId to the FE if log in is successful
   * @param {string} email
   * @param {string} password
   */
  async logIn(req, res) {
    console.log("logging in");
    const { email, password } = req.body;
    const user = await this.model.findOne({ email });
    try {
      if (!user) {
        res.send("The email or password is incorrect");
      } else {
        const logInSuccess = await bcrypt.compare(password, user.password);

        if (logInSuccess) {
          const payload = {
            _id: user._id,
            name: user.name,
            address: user.address,
          };
          const token = jwt.sign(payload, this.salt, { expiresIn: "6h" });
          console.log(user);
          res.send({ token, userId: user._id });
        } else {
          res.send("The email or password is incorrect");
        }
      }
    } catch (err) {
      this.errorHandler(err, res);
    }
  }

  /** Returns a token to the FE if sign up is successful
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} address
   */
  async signUp(req, res) {
    console.log("signing up");
    const { name, email, password, address } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      const newUser = await this.model.create({
        name,
        email,
        password: hash,
        address,
      });
      if (!newUser) {
        res.send("Something went wrong when creating a new user");
      } else {
        const payload = {
          _id: newUser._id,
          name: newUser.name,
          address: newUser.address,
        };
        const token = jwt.sign(payload, this.salt, {
          expiresIn: "6h",
        });
        res.send({ token, userId: newUser._id });
      }
    } catch (err) {
      this.errorHandler(err, res);
    }
  }

  // get user by email

  // add friend

  // accept friend request

  // request payment

  // approve payment

  // Part 2: join new group
}

module.exports = UserController;