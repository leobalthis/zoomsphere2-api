/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_sentinent', {
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
    monitoring_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sentinent: {
      type: DataTypes.ENUM('positive','negative','neutral'),
      allowNull: true
    }
  }, {
    tableName: 'mentions_sentinent',
    freezeTableName: true
  });
};
