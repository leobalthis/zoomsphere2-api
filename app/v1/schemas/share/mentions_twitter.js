/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_twitter', {
    id: {
      type: 'CHAR(50)',
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    data: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lang: {
      type: 'CHAR(2)',
      allowNull: true
    }
  }, {
    tableName: 'mentions_twitter',
    freezeTableName: true
  });
};
