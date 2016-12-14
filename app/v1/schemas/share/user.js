/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: 'CHAR(30)',
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nick: {
      type: DataTypes.STRING,
      allowNull: true
    },
    b2b_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    date_logged: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_registered: {
      type: DataTypes.DATE,
      allowNull: false
    },
    account: {
      type: DataTypes.ENUM('facebook','twitter','zoomsphere','google'),
      allowNull: false,
      defaultValue: 'facebook'
    },
    userInfo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hash: {
      type: 'CHAR(10)',
      allowNull: true
    },
    zoomsphereEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    googleAccountId: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    facebookAccountId: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    token: {
      type: 'CHAR(20)',
      allowNull: true
    },
    tariff: {
      type: 'CHAR(20)',
      allowNull: true
    },
    date_paid: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_charts: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_engagement_console: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_monitoring: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_publisher: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_contacts: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_social_inbox: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tariff_whitelabel: {
      type: DataTypes.DATE,
      allowNull: true
    },
    period_check: {
      type: DataTypes.DATE,
      allowNull: true
    },
    whitelabel_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    company_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    demo: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    apitoken: {
      type: 'CHAR(36)',
      allowNull: true
    },
    status_new: {
      type: DataTypes.ENUM('UNCOMPLETE','TEMPORARY','UNCONFIRMED_EMAIL','COMPLETE'),
      allowNull: false,
      defaultValue: 'UNCONFIRMED_EMAIL'
    }
  }, {
    tableName: 'user',
    freezeTableName: true
  });
};
