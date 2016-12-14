/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('charts_facebook_pages_post_text', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    actor_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    comment: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    like: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    share: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    engagement: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    type: {
      type: 'CHAR(8)',
      allowNull: false
    },
    rr_user_post: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    post: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'charts_facebook_pages_post_text',
    freezeTableName: true
  });
};
