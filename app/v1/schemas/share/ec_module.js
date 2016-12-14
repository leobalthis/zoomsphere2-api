/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ec_module', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    name: {
      type: 'CHAR(40)',
      allowNull: false
    },
    label: {
      type: 'CHAR(20)',
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    module: {
      type: DataTypes.ENUM('socialinbox','email','rss','monitoring','publisher','report','chart','analytics','comparisons','customercare'),
      allowNull: true
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sort: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: '0'
    },
    workspace_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'workspace',
        key: 'id'
      }
    }
  }, {
    tableName: 'ec_module',
    freezeTableName: true
  });
};
