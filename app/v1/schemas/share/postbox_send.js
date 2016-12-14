/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postbox_send', {
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_publish: {
      type: DataTypes.DATE,
      allowNull: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    account: {
      type: 'CHAR(30)',
      allowNull: false
    }
  }, {
    tableName: 'postbox_send',
    freezeTableName: true
  });
};
