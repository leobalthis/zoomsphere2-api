/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postbox_schedule', {
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
    approved: {
      type: DataTypes.ENUM('ok','no'),
      allowNull: false,
      defaultValue: 'no'
    },
    date_change: {
      type: DataTypes.DATE,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_publish: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_send: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('wait','sent','draft','concept'),
      allowNull: false,
      defaultValue: 'wait'
    },
    status_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'postbox_status',
        key: 'id'
      }
    },
    label_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'user_label_outgoing',
        key: 'id'
      }
    },
    rss_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rss_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    rss_url_hash: {
      type: 'CHAR(40)',
      allowNull: true
    },
    timezone: {
      type: 'CHAR(30)',
      allowNull: true
    }
  }, {
    tableName: 'postbox_schedule',
    freezeTableName: true,
    timestamps: false
  });
};
