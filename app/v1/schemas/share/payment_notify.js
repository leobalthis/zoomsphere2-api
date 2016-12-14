/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payment_notify', {
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
    txt_type: {
      type: 'CHAR(30)',
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    request: {
      type: 'CHAR(20)',
      allowNull: true
    },
    status: {
      type: 'CHAR(20)',
      allowNull: true
    },
    subscr_id: {
      type: 'CHAR(30)',
      allowNull: true
    }
  }, {
    tableName: 'payment_notify',
    freezeTableName: true
  });
};
