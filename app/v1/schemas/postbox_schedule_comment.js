/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postbox_schedule_comment', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    schedule_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'postbox_schedule',
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
    visibility: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'postbox_schedule_comment',
    freezeTableName: true,
    timestamps: false
  });
};
