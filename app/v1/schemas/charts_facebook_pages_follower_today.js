/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('charts_facebook_pages_follower_today', {
    item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    count: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    today_change: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    yesterday_change: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    this_week_change: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    last_week_change: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    this_month_change: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    last_month_change: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'charts_facebook_pages_follower_today',
    freezeTableName: true
  });
};
