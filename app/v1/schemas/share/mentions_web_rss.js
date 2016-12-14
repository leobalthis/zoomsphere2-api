/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_web_rss', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_story_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    update: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: '30'
    },
    valid: {
      type: DataTypes.ENUM('0','1'),
      allowNull: false,
      defaultValue: '1'
    },
    country: {
      type: 'CHAR(2)',
      allowNull: false
    },
    lang: {
      type: 'CHAR(2)',
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('Sport','IT','News'),
      allowNull: false,
      defaultValue: 'News'
    },
    type: {
      type: DataTypes.ENUM('blog','magazine'),
      allowNull: false,
      defaultValue: 'magazine'
    },
    source_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'mentions_web_rss',
    freezeTableName: true
  });
};
