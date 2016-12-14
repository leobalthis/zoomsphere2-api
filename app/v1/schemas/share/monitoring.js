/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('monitoring', {
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
    name: {
      type: 'CHAR(50)',
      allowNull: false
    },
    query_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    excluded: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    history: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    ec: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'monitoring',
    freezeTableName: true
  });
};
