/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_settings_mentions_query', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    query: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lang: {
      type: 'CHAR(2)',
      allowNull: true
    },
    query_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    social_network: {
      type: 'CHAR(50)',
      allowNull: false,
      defaultValue: 'all'
    },
    last_export: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'user_settings_mentions_query',
    freezeTableName: true
  });
};
