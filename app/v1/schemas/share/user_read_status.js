/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_read_status', {
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
    icon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sort: {
      type: DataTypes.INTEGER(2),
      allowNull: false
    },
    default: {
      type: DataTypes.ENUM('1'),
      allowNull: true
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
    tableName: 'user_read_status',
    freezeTableName: true
  });
};
