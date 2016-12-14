/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ec_module_rule_query', {
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
    query_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'mentions_query',
        key: 'id'
      }
    }
  }, {
    tableName: 'ec_module_rule_query',
    freezeTableName: true
  });
};
