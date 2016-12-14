/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mentions_user_twitter', {
    id: {
      type: 'CHAR(50)',
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    },
    czech: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    follower: {
      type: 'CHAR(50)',
      allowNull: true
    },
    last_id: {
      type: 'CHAR(50)',
      allowNull: true
    },
    last_datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_request: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lang: {
      type: 'CHAR(2)',
      allowNull: true
    }
  }, {
    tableName: 'mentions_user_twitter',
    freezeTableName: true
  });
};
