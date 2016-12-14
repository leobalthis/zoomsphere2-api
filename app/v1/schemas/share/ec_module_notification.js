/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ec_module_notification', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    module_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'ec_module',
        key: 'id'
      }
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ec_module_notification',
    freezeTableName: true
  });
};
