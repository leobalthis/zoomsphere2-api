/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_linkedin_page', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    page_id: {
      type: 'CHAR(40)',
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_id: {
      type: 'CHAR(40)',
      allowNull: false,
      references: {
        model: 'user_account',
        key: 'account_id'
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'user_linkedin_page',
    freezeTableName: true
  });
};
