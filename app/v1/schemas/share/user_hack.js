/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_hack', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    hack: {
      type: 'CHAR(40)',
      allowNull: false,
      defaultValue: ''
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'user_hack',
    freezeTableName: true
  });
};
