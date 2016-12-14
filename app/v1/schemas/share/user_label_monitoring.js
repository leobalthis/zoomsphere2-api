/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_label_monitoring', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    post_id: {
      type: 'CHAR(32)',
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    label_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'user_label_monitoring',
    freezeTableName: true
  });
};
