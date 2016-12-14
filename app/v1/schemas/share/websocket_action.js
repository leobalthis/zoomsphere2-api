/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('websocket_action', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      references: {
        model: 'user',
        key: 'id'
      }
    },
    master_account_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      references: {
        model: 'user',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    },
    action: {
      type: 'CHAR(50)',
      allowNull: true,
      defaultValue: ''
    },
    item_id: {
      type: 'CHAR(50)',
      allowNull: false,
      defaultValue: '0'
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'websocket_action',
    freezeTableName: true
  });
};
