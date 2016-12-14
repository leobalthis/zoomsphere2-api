/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('share_user_email_invite', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    from_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    hash: {
      type: 'CHAR(20)',
      allowNull: false,
      defaultValue: 'wait'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'share_user_email_invite',
    freezeTableName: true
  });
};
