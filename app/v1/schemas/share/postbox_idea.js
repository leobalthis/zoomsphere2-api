/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postbox_idea', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    workspace_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'workspace',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rss_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rss_url_hash: {
      type: 'CHAR(40)',
      allowNull: true
    }
  }, {
    tableName: 'postbox_idea',
    freezeTableName: true
  });
};
