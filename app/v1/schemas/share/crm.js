/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('crm', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    master_account_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    complete: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date_created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    employer_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'crm_employer',
        key: 'id'
      }
    },
    employer_type_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'crm_employer_type',
        key: 'id'
      }
    },
    position_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'crm_position',
        key: 'id'
      }
    },
    city_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'crm_city',
        key: 'id'
      }
    },
    country_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'crm_country',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    customer_id: {
      type: 'CHAR(25)',
      allowNull: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'crm',
    freezeTableName: true
  });
};
