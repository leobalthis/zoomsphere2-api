/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('email_templates', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    lang: {
      type: 'CHAR(2)',
      allowNull: false,
      defaultValue: 'en'
    },
    code: {
      type: 'CHAR(50)',
      allowNull: false
    },
    from_email: {
      type: 'CHAR(255)',
      allowNull: true
    },
    from_name: {
      type: 'CHAR(255)',
      allowNull: true
    },
    subject: {
      type: 'CHAR(255)',
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'email_templates',
    freezeTableName: true,
    timestamps: false
  });
};
