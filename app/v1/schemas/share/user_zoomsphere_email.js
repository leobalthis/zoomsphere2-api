/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_zoomsphere_email', {
    UserId: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    Type: {
      type: DataTypes.ENUM('googleplus','facebook'),
      allowNull: false
    },
    Checked: {
      type: DataTypes.ENUM('0','1'),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'user_zoomsphere_email',
    freezeTableName: true
  });
};
