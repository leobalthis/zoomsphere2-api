/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('email', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    imap_username: {
      type: 'CHAR(50)',
      allowNull: true
    },
    smtp_username: {
      type: 'CHAR(50)',
      allowNull: true
    },
    imap_password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    smtp_password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imap_server: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    smtp_server: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    imap_port: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    smtp_port: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    imap_secure: {
      type: DataTypes.ENUM('ssl','tls','none'),
      allowNull: true
    },
    smtp_secure: {
      type: DataTypes.ENUM('ssl','tls','none'),
      allowNull: true
    },
    settings: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'email',
    freezeTableName: true,
    timestamps: false
  });
};
