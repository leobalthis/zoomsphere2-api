/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payment_period', {
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
    date_paid: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff: {
      type: 'CHAR(50)',
      allowNull: true
    },
    payment_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'payment_period',
    freezeTableName: true
  });
};
