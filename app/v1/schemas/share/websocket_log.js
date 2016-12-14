/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('websocket_log', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00'
    },
    action: {
      type: 'CHAR(50)',
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00'
    },
    param: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    type: {
      type: 'CHAR(50)',
      allowNull: false,
      defaultValue: '0'
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'websocket_log',
    freezeTableName: true
  });
};
