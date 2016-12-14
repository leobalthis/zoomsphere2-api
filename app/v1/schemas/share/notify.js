/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notify', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('new','old'),
      allowNull: true
    }
  }, {
    tableName: 'notify',
    freezeTableName: true
  });
};
