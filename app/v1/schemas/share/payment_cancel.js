/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payment_cancel', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    payment_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    param: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ACK: {
      type: 'CHAR(20)',
      allowNull: true
    }
  }, {
    tableName: 'payment_cancel',
    freezeTableName: true
  });
};
