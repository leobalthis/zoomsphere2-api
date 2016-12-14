/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('monitoring_tag_post', {
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
    monitoring_tag_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    post_id: {
      type: 'CHAR(32)',
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'monitoring_tag_post',
    freezeTableName: true
  });
};
