/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_index_facebook', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    query_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    keyword: {
      type: 'CHAR(40)',
      allowNull: true,
      defaultValue: '0'
    },
    locale: {
      type: 'CHAR(5)',
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'mentions_index_facebook',
    freezeTableName: true
  });
};
