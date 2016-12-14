/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('charts_facebook_pages_daily', {
    item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    follower: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    talking_about: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'charts_facebook_pages_daily',
    freezeTableName: true
  });
};
