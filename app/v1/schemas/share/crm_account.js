/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('crm_account', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    crm_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'crm',
        key: 'id'
      }
    },
    site: {
      type: DataTypes.ENUM('facebook','twitter','googleplus','youtube','linkedin','email'),
      allowNull: true
    },
    account_id: {
      type: 'CHAR(50)',
      allowNull: true
    },
    name: {
      type: 'CHAR(50)',
      allowNull: true
    },
    user_name: {
      type: 'CHAR(50)',
      allowNull: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_created: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'crm_account',
    freezeTableName: true
  });
};
