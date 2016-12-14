/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('b2b', {
    id: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    rev_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER(2),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subscription: {
      type: DataTypes.ENUM('none','expired','paid'),
      allowNull: true,
      defaultValue: 'none'
    }
  }, {
    tableName: 'b2b',
    freezeTableName: true
  });
};
