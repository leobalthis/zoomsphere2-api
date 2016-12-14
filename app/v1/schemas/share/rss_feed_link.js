/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rss_feed_link', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: 'CHAR(255)',
      allowNull: false,
      defaultValue: '0'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rss_feed_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    like: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    share: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    comment: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    engagement: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    click: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    }
  }, {
    tableName: 'rss_feed_link',
    freezeTableName: true
  });
};
