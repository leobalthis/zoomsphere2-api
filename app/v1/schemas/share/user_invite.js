/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_invite', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    hash: {
      type: 'CHAR(40)',
      allowNull: false
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('new','wait','accepted','error'),
      allowNull: false,
      defaultValue: 'new'
    },
    info: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'user_invite',
    freezeTableName: true
  });
};
