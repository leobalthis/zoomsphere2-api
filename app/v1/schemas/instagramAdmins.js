/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('instagramAdmins', {
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    account_id: {
      type: DataTypes.STRING,
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
    freezeTableName: true,
    timestamps: false
  });
};
