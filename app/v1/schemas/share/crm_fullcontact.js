/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('crm_fullcontact', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    site: {
      type: DataTypes.ENUM('facebook','twitter','email'),
      allowNull: false
    },
    account_id: {
      type: 'CHAR(50)',
      allowNull: false
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    }
  }, {
    tableName: 'crm_fullcontact',
    freezeTableName: true
  });
};
