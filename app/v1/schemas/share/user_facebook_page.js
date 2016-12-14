/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_facebook_page', {
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
      type: DataTypes.BIGINT,
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: false
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    country: {
      type: 'CHAR(2)',
      allowNull: true
    },
    invalid: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    last_used: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user_facebook_page',
    freezeTableName: true
  });
};
