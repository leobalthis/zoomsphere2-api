/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('publish_log', {
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
    message_type: {
      type: 'CHAR(10)',
      allowNull: false
    },
    post: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'publish_log',
    freezeTableName: true
  });
};
