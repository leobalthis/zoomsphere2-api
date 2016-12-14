/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reply_to_approve', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    module: {
      type: DataTypes.ENUM('monitoring','socialinbox','customercare'),
      allowNull: true
    },
    param: {
      type: 'CHAR(10)',
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('wait','sent'),
      allowNull: true,
      defaultValue: 'wait'
    }
  }, {
    tableName: 'reply_to_approve',
    freezeTableName: true
  });
};
