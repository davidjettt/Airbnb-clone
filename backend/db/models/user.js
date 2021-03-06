'use strict';

const bcrypt = require('bcryptjs');
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    toSafeObject() {
      const { id, firstName, lastName, email } = this;
      return { id, firstName, lastName, email };
    }

    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString())
    }

    static getCurrentUserById(id) {
      return User.scope("currentUser").findByPk(id);
    }

    static async login({ email, password }) {
      const { Op } = require('sequelize');
      const user = await User.scope('loginUser').findOne({
        where: {
            email: email

        }
      });
      if (user && user.validatePassword(password)) {
        return await User.scope('currentUser').findByPk(user.id);
      }
    }

    static async signup({ firstName, lastName, email, password }) {
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({
        firstName,
        lastName,
        email,
        hashedPassword
      });
      return await User.scope('currentUser').findByPk(user.id);
    }
    static associate(models) {
      // define association here
      User.hasMany(models.Spot, {foreignKey: 'ownerId'})
      User.hasMany(models.Booking, {foreignKey: 'userId'})
      User.hasMany(models.Review, {foreignKey: 'userId'})
    }
  }
  User.init({
    // username: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     len: [4, 30],
    //     isNotEmail(value) {
    //       if (Validator.isEmail(value)) {
    //         throw new Error("Cannot be an email.");
    //       }
    //     }
    //   }
    // },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
      }
    },
    scopes: {
      currentUser: {
        attributes: { exclude: ["hashedPassword", "createdAt", "updatedAt"] }
      },
      loginUser: {
        attributes: {}
      }
    }
  });
  return User;
};
