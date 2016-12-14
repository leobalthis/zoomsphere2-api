/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ec_module_rule_profile', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    rule_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'ec_module_rule',
        key: 'id'
      }
    },
    profile: {
      type: 'CHAR(50)',
      allowNull: false
    },
    site: {
      type: DataTypes.ENUM('facebook','twitter','googleplus','linkedin'),
      allowNull: true
    }
  }, {
    tableName: 'ec_module_rule_profile',
    freezeTableName: true
  });
};
