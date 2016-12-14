/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tooltip', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    tooltip: {
      type: 'CHAR(20)',
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'tooltip',
    freezeTableName: true
  });
};
