/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('facebook_post', {
    id: {
      type: 'CHAR(40)',
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    page_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    post: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    postbox_schedule_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'facebook_post',
    freezeTableName: true
  });
};
