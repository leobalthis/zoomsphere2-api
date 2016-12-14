/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('facebook_user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    local_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    global_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    data: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: 'CURRENT_TIMESTAMP'
    }
  }, {
    tableName: 'facebook_user',
    freezeTableName: true
  });
};
