/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('share_youtube_channel', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    from_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    to_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    user_youtube_channel_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    grant: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'share_youtube_channel',
    freezeTableName: true,
    timestamps: false
  });
};
