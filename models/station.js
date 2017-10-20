module.exports = function(sequelize, DataTypes) {
  var Station = sequelize.define("Station", {
    station_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    short_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    lat: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: false
    },
    lng: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: false
    }
  });
  return Station;
};