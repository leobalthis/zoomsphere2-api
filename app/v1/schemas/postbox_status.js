/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postbox_status', {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: 'CHAR(17)',
      allowNull: false
    },
    access_read: {
      type: DataTypes.STRING,
      allowNull: false
    },
    access_write: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    publish: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    bgcolor: {
      type: 'CHAR(17)',
      allowNull: false
    },
    sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
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
    tableName: 'postbox_status',
    freezeTableName: true,
    timestamps: false
  });
};
