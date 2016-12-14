/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('invoice', {
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
    date_created: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_notify_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    data_html: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_text: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'invoice',
    freezeTableName: true
  });
};
