/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_label_outgoing', {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: 'CHAR(7)',
      allowNull: false
    },
    workspace_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'workspace',
        key: 'id'
      }
    }
  }, {
    tableName: 'user_label_outgoing',
    freezeTableName: true
  });
};
