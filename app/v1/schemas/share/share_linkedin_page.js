/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('share_linkedin_page', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    from_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    to_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    user_linkedin_page_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user_linkedin_page',
        key: 'id'
      }
    },
    grant: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'share_linkedin_page',
    freezeTableName: true
  });
};
