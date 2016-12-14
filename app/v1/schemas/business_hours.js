/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('business_hours', {
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
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    hours: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'business_hours',
    freezeTableName: true,
    timestamps: false
  });
};
