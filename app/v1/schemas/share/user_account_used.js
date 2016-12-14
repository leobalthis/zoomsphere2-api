/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_account_used', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account: {
      type: DataTypes.ENUM('twitter','facebook','googleplus','google'),
      allowNull: false
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    count: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    }
  }, {
    tableName: 'user_account_used',
    freezeTableName: true
  });
};
