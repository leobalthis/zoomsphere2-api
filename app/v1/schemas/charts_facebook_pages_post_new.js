/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('charts_facebook_pages_post_new', {
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
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    like: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    share: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    engagement: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('STATUSES','LINKS','VIDEOS','PHOTOS'),
      allowNull: true
    },
    rr_user_post: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    post_id: {
      type: 'CHAR(40)',
      allowNull: false
    },
    item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true,
      references: {
        model: '',
        key: ''
      }
    }
  }, {
    tableName: 'charts_facebook_pages_post_new',
    freezeTableName: true
  });
};
