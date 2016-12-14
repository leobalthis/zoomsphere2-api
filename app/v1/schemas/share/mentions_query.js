/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_query', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    query: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lang: {
      type: 'CHAR(2)',
      allowNull: false
    },
    date_process: {
      type: DataTypes.DATE,
      allowNull: true
    },
    avg_per_day: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    db: {
      type: DataTypes.ENUM('mentions_01','mentions_02'),
      allowNull: false,
      defaultValue: 'mentions_01'
    },
    server: {
      type: DataTypes.ENUM('index'),
      allowNull: false,
      defaultValue: 'index'
    },
    social_network: {
      type: 'CHAR(60)',
      allowNull: false,
      defaultValue: 'all'
    },
    first_unused: {
      type: DataTypes.DATE,
      allowNull: true
    },
    index: {
      type: DataTypes.ENUM('1','0'),
      allowNull: true,
      defaultValue: '1'
    },
    version: {
      type: 'CHAR(1)',
      allowNull: true
    }
  }, {
    tableName: 'mentions_query',
    freezeTableName: true
  });
};
