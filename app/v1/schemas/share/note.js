/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    to_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    ec_module_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'ec_module',
        key: 'id'
      }
    },
    table: {
      type: DataTypes.ENUM('socialinbox'),
      allowNull: true,
      defaultValue: 'socialinbox'
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    from_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    tableName: 'note',
    freezeTableName: true
  });
};
