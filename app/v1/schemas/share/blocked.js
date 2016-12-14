/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('blocked', {
    id: {
      type: DataTypes.INTEGER(30),
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'blocked',
    freezeTableName: true
  });
};
