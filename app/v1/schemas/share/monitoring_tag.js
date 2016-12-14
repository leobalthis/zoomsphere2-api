/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('monitoring_tag', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    monitoring_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    name: {
      type: 'CHAR(50)',
      allowNull: false
    }
  }, {
    tableName: 'monitoring_tag',
    freezeTableName: true
  });
};
