/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_backend_status', {
    column: {
      type: 'CHAR(50)',
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: '_backend_status',
    freezeTableName: true
  });
};
