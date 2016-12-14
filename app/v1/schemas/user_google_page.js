/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_google_page', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    page_id: {
      type: 'CHAR(30)',
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
      type: 'CHAR(30)',
      allowNull: true
    }
  }, {
    tableName: 'user_google_page',
    freezeTableName: true,
    timestamps: false
  });
};
