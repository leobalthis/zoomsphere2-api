/* jshint indent: 2 */

var MODULE_TYPES = [ 'socialinbox', 'email', 'rss', 'monitoring', 'publisher', 'report', 'chart', 'analytics', 'comparisons', 'customercare' ];

module.exports = function(sequelize, DataTypes) {
  var definition = sequelize.define('ec_module', {
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
      type: DataTypes.ENUM(MODULE_TYPES),
      allowNull: true
    },
    settings: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sort: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: 0
    },
    workspace_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'ec_module',
    freezeTableName: true,
    timestamps: false
  });
  definition.MODULE_TYPES = MODULE_TYPES;
  return definition;
};
