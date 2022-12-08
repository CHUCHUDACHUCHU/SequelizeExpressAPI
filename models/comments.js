'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {
        foreignKey: 'userId'
      });
      this.belongsTo(models.Posts, {
        foreignKey: 'postId'
      });
    }
  }
  Comments.init({
    commentId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    postId: {
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'postId'
      },
      onDelete: 'cascade',
      type: DataTypes.INTEGER
    },
    userId: {
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId'
      },
      onDelete: 'cascade',
      type: DataTypes.INTEGER
    },
    content: {
      allowNull: false,
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};