/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('facebook_post_settings', {
    page_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'facebook_post_settings',
    freezeTableName: true
  });
};
