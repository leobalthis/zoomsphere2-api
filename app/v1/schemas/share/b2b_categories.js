/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('b2b_categories', {
    id: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'b2b_categories',
    freezeTableName: true
  });
};
