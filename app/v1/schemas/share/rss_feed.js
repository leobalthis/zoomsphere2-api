/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rss_feed', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_story_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    valid: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'rss_feed',
    freezeTableName: true
  });
};
