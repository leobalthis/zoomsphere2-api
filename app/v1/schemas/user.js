var db = require(__dirname + '/../../../services').db;
var UserAccountSchema = db.import(__dirname + '/user_account');
var ShareUserSchema = db.import(__dirname + '/share_user');
var WorkspaceSchema = db.import(__dirname + '/workspace');

module.exports = function (sequelize, DataTypes) {

  var user = sequelize.define('user', {
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
      type: DataTypes.ENUM('FACEBOOK', 'TWITTER', 'ZOOMSPHERE', 'GOOGLE'),
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
    country: {
      type: 'CHAR(2)',
      allowNull: true
    },
    timezone: {
      type: 'CHAR(30)',
      allowNull: true
    },
    about: {
      type: DataTypes.STRING,
      allowNull: true
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image_big: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://www.zoomsphere.com/img/anonym.gif'
    },
    image_square: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://www.zoomsphere.com/img/anonym.gif'
    },
    state: {
      type: DataTypes.ENUM('uncompleted', 'completed', 'temporary', 'unconfirmed email', 'deleted', 'forgotten_password'),
      allowNull: false,
      defaultValue: 'uncompleted'
    },
    role: {
      type: DataTypes.ENUM('root','administrator'),
      allowNull: true
    }
  }, {
    tableName: 'user',
    freezeTableName: true,
    timestamps: false
  });

  user.hasMany(UserAccountSchema, {as: 'UserAccount', foreignKey: 'user_id'});
  user.hasMany(ShareUserSchema, {as: 'SlaveUser', foreignKey: 'from_user_id'});
  user.hasMany(ShareUserSchema, {as: 'MasterUser', foreignKey: 'to_user_id'});
  user.hasMany(WorkspaceSchema, {as: 'Workspace', foreignKey: 'user_id'});
  return user
};
