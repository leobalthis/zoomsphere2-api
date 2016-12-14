/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ec_module_rss', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    module_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'ec_module',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    item_id: {
      type: 'CHAR(20)',
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    status_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    delay: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
      defaultValue: '30'
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true
    },
    site: {
      type: DataTypes.ENUM('facebook','twitter','googleplus','linkedin'),
      allowNull: false,
      defaultValue: 'facebook'
    }
  }, {
    tableName: 'ec_module_rss',
    freezeTableName: true
  });
};
