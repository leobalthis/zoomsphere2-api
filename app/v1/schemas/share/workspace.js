/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('workspace', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    name: {
      type: 'CHAR(40)',
      allowNull: false
    }
  }, {
    tableName: 'workspace',
    freezeTableName: true
  });
};
