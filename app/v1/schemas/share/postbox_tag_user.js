/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postbox_tag_user', {
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
    tag_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'postbox_tag',
        key: 'id'
      }
    },
    postbox_schedule_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'postbox_schedule',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'postbox_tag_user',
    freezeTableName: true
  });
};
