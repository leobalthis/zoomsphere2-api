/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('crm_tag_user', {
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
    tag_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'crm_tag',
        key: 'id'
      }
    },
    crm_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'crm',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'crm_tag_user',
    freezeTableName: true
  });
};
