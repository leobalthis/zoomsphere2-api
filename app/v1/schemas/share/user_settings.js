/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_settings', {
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    orig: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'user_settings',
    freezeTableName: true
  });
};
