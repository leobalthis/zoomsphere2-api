/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_account', {
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
    account_id: {
      type: 'CHAR(40)',
      allowNull: false
    },
    account: {
      type: DataTypes.ENUM('TWITTER','FACEBOOK','GOOGLEPLUS','GOOGLE','LINKEDIN','INSTAGRAM'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountInfo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    invalid: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    last_used: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '2013-12-13 14:08:27'
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'user_account',
    freezeTableName: true,
    timestamps: false
  });
};
