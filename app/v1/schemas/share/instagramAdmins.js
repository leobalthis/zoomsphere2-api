/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('instagramAdmins', {
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    account_id: {
      type: 'CHAR(40)',
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    grant: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'instagramAdmins',
    freezeTableName: true
  });
};
