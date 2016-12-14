/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('crm_account_partner', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: 'CHAR(50)',
      allowNull: false
    },
    master_account_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    site: {
      type: DataTypes.ENUM('facebook','twitter','googleplus','youtube','linkedin'),
      allowNull: false
    },
    data: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'crm_account_partner',
    freezeTableName: true
  });
};
