/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_index_twitter', {
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
    last_id: {
      type: 'CHAR(40)',
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'mentions_index_twitter',
    freezeTableName: true
  });
};
