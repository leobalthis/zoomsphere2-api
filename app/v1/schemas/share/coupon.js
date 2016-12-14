/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('coupon', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    coupon: {
      type: 'CHAR(20)',
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    }
  }, {
    tableName: 'coupon',
    freezeTableName: true
  });
};
