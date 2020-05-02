
module.exports = (sequelize, DataTypes) => {
  const bookmark = sequelize.define('bookmark', {
    guid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    link: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    favorites: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
  });

  bookmark.associate = function () {

  };

  return bookmark;
};
