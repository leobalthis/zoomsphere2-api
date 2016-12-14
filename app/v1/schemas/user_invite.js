/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_invite', {
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
    hash: {
      type: 'CHAR(40)',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('new','wait','accepted','error'),
      allowNull: false,
      defaultValue: 'wait'
    },
    text: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user_invite',
    freezeTableName: true,
    timestamps: false
  });
};
